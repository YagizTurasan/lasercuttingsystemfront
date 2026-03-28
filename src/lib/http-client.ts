interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

interface HttpError {
  message: string;
  status?: number;
  errors?: string[];
}

class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, timeout = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('laser_cutting_access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('laser_cutting_refresh_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<HttpResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const token = this.getAuthToken();
    const headers = {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401 && token) {
        const refreshToken = this.getRefreshToken();
        if (refreshToken && !endpoint.includes('/refresh-token')) {
          try {
            const refreshResponse = await fetch(`${this.baseURL}/Auth/refresh-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              this.setAuthToken(refreshData.accessToken);
              this.setRefreshToken(refreshData.refreshToken);

              const retryHeaders = {
                ...headers,
                Authorization: `Bearer ${refreshData.accessToken}`
              };

              const retryResponse = await fetch(url, {
                ...config,
                headers: retryHeaders,
              });

              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                return {
                  data: retryData,
                  status: retryResponse.status,
                  statusText: retryResponse.statusText,
                };
              }
            }
          } catch (refreshError) {
            this.clearAuthToken();
            throw {
              message: 'Session expired. Please login again.',
              status: 401,
              errors: ['Authentication token expired'],
            } as HttpError;
          }
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.message || `HTTP Error: ${response.status}`,
          status: response.status,
          errors: errorData.errors || [],
        } as HttpError;
      }

      const data = await response.json();
      
      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout - no response from server',
          errors: ['Please check your internet connection and try again'],
        } as HttpError;
      }

      if (error.message?.includes('Failed to fetch')) {
        throw {
          message: 'Network error - cannot connect to server',
          errors: ['Please check if the server is running'],
        } as HttpError;
      }

      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'GET' });
    return response.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
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

  buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object') {
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    
    return queryParams.toString() ? `?${queryParams.toString()}` : '';
  }

  setAuthToken(token: string) {
    localStorage.setItem('laser_cutting_access_token', token);
  }

  setRefreshToken(token: string) {
    localStorage.setItem('laser_cutting_refresh_token', token);
  }

  clearAuthToken() {
    localStorage.removeItem('laser_cutting_access_token');
    localStorage.removeItem('laser_cutting_refresh_token');
  }

  hasAuthToken(): boolean {
    return !!this.getAuthToken() && !!this.getRefreshToken();
  }
}

export const httpClient = new HttpClient('https://localhost:7206/api');
