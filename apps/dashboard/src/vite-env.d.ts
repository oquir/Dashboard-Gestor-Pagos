/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL de FormMaker; sin ella se usa la de desarrollo local. */
  readonly VITE_FORM_BUILDER_URL?: string
}
