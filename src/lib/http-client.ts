import { API_CONFIG } from './config';

interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export interface HttpError {
  message: string;
  status?: number;
  errors?: string[];
}

/** Yakalanan bir hatadan kullanıcıya gösterilecek mesajı çıkarır */
export function getErrorMessage(error: unknown, fallback: string): string {
  return (error as HttpError | undefined)?.message || fallback;
}

// Bu uçlarda 401 "oturum süresi doldu" anlamına gelmez; token yenileme denenmez
const NO_REFRESH_ENDPOINTS = [
  API_CONFIG.ENDPOINTS.AUTH.LOGIN,
  API_CONFIG.ENDPOINTS.AUTH.REGISTER,
  API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
  API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
  API_CONFIG.ENDPOINTS.AUTH.FORGOTPASSWORD,
  API_CONFIG.ENDPOINTS.AUTH.RESETPASSWORD,
  API_CONFIG.ENDPOINTS.AUTH.VERIFYEMAIL,
  API_CONFIG.ENDPOINTS.AUTH.SENDEMAILVERIFICATION,
];

interface TokenResponse {
  accessToken: string;
  expiresAt: string;
}

// Access token yalnızca bellekte tutulur; refresh token backend tarafından httpOnly cookie olarak yönetilir.
// Böylece XSS ile çalıştırılan bir script token'ları kalıcı depodan okuyamaz.
class HttpClient {
  private baseURL: string;
  private timeout: number;
  private accessToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private sessionExpiredHandler: (() => void) | null = null;

  constructor(baseURL: string, timeout = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      return await fetch(url, { ...init, credentials: 'include', signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildHeaders(options: RequestInit, isFormData: boolean): Record<string, string> {
    return {
      // FormData gönderirken Content-Type'ı tarayıcı boundary ile birlikte kendisi belirler
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      ...(options.headers as Record<string, string> | undefined),
    };
  }

  private async parseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<HttpResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = options.body instanceof FormData;

    let response: Response;
    try {
      response = await this.fetchWithTimeout(url, {
        ...options,
        headers: this.buildHeaders(options, isFormData),
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw {
          message: 'Request timeout - no response from server',
          errors: ['Please check your internet connection and try again'],
        } as HttpError;
      }
      throw {
        message: 'Network error - cannot connect to server',
        errors: ['Please check if the server is running'],
      } as HttpError;
    }

    if (response.status === 401 && !isRetry && !NO_REFRESH_ENDPOINTS.includes(endpoint)) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(endpoint, options, true);
      }
      this.sessionExpiredHandler?.();
    }

    const body = await this.parseBody(response);

    if (!response.ok) {
      // Bazı uçlar JSON yerine düz metin hata döner (ör. ExcelUpload)
      const errorBody = (typeof body === 'object' && body !== null ? body : {}) as Partial<HttpError>;
      throw {
        message: (typeof body === 'string' ? body : errorBody.message) || `HTTP Error: ${response.status}`,
        status: response.status,
        errors: errorBody.errors || [],
      } as HttpError;
    }

    return {
      data: body as T,
      status: response.status,
      statusText: response.statusText,
    };
  }

  /**
   * Refresh token cookie'si ile yeni access token alır.
   * Aynı anda gelen 401'ler tek bir yenileme isteğini paylaşır.
   */
  refreshAccessToken(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const response = await this.fetchWithTimeout(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!response.ok) {
            this.accessToken = null;
            return false;
          }
          const data = (await response.json()) as TokenResponse;
          this.accessToken = data.accessToken;
          return true;
        } catch {
          this.accessToken = null;
          return false;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }
    return this.refreshPromise;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'GET' });
    return response.data;
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'DELETE' });
    return response.data;
  }

  /** Dosya indirir (ör. Excel şablonu); kimlik doğrulama başlığı ve token yenileme normal isteklerdeki gibi uygulanır */
  async download(endpoint: string): Promise<Blob> {
    const send = () => this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.buildHeaders({}, true),
    });

    let response = await send();
    if (response.status === 401 && await this.refreshAccessToken()) {
      response = await send();
    }
    if (!response.ok) {
      throw { message: `HTTP Error: ${response.status}`, status: response.status, errors: [] } as HttpError;
    }
    return response.blob();
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'POST', body: formData });
    return response.data;
  }

  buildQueryString(params: Record<string, unknown>): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object') {
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    return queryParams.toString() ? `?${queryParams.toString()}` : '';
  }

  setAuthToken(token: string) {
    this.accessToken = token;
  }

  clearAuthToken() {
    this.accessToken = null;
  }

  hasAuthToken(): boolean {
    return !!this.accessToken;
  }

  onSessionExpired(handler: () => void) {
    this.sessionExpiredHandler = handler;
  }
}

export const httpClient = new HttpClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);
