/** Dónde corre FormMaker. En local, el puerto fijo de su vite.config.ts. */
export const FORM_BUILDER_URL: string =
  import.meta.env.VITE_FORM_BUILDER_URL ?? 'http://localhost:5174'
