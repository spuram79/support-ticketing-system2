/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_API_URL?: string;
  PORT?: number;
  NODE_ENV?: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}