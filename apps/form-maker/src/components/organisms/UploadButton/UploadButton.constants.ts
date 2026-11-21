import { ACTION_TIER_CLASSES } from '../../../constants'

// Primario: el unico relleno de la pantalla. Deshabilitado mientras sube: el spinner y el toast
// cuentan la espera.
export const UPLOAD_BUTTON_CLASSES: string = ACTION_TIER_CLASSES.primary.compact

export const UPLOAD_LABEL: string = 'Revisar el formulario y subirlo a la API'

export const UPLOADING_LABEL: string = 'Subiendo el formulario…'
