// El unico boton relleno de la fila. Deshabilitado mientras sube: el spinner y el toast cuentan la
// espera.
export const UPLOAD_BUTTON_CLASSES: string =
  'flex items-center gap-1.5 rounded-md bg-brand-strong px-2.5 py-1 text-xs font-medium text-on-brand-strong press hover:bg-brand-strong/90 hover:cursor-pointer disabled:cursor-wait disabled:opacity-80 disabled:hover:bg-brand-strong'

export const UPLOAD_LABEL: string = 'Revisar el formulario y subirlo a la API'

export const UPLOADING_LABEL: string = 'Subiendo el formulario…'
