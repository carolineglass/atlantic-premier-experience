interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_USERNAME: string;
  readonly VITE_API_PASSWORD: string;
  readonly VITE_ENV: 'development' | 'production' | 'staging';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
