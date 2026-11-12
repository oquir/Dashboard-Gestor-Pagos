/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del orquestador de formularios; sin ella se usa la de desarrollo local. */
  readonly VITE_FORM_BUILDER_URL?: string
}
