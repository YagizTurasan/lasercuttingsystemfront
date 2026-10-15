/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API kök adresi. Boş bırakılırsa '/api' kullanılır (geliştirmede Vite proxy'si). */
  readonly VITE_API_URL?: string;
  /** Geliştirme sunucusunun '/api' isteklerini yönlendireceği backend adresi. */
  readonly VITE_API_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
