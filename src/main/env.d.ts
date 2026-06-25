/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly STRATZ_API_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
