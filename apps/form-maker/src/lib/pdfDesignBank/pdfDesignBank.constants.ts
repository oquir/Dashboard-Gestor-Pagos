// Una llave por impuesto, aparte del borrador del formulario: descartar un borrador no se lleva el
// PDF, y el PDF nunca entra al borrador ni al export. Prefijo del nombre viejo, como las demas.
export const PDF_DESIGN_KEY_PREFIX: string = 'form-orchestrator-pdf-'

// Sube con cada cambio de forma del diseño guardado, junto con su paso de migracion.
export const PDF_DESIGN_SCHEMA_VERSION: number = 1

export const QUOTA_MESSAGE: string =
  'No cupo en el almacenamiento del navegador (unos 5 MB). Las imágenes en base64 son lo que más pesa: pásalas a URL.'

export const SAVE_FAILED_MESSAGE: string = 'No se pudo guardar el diseño en el navegador.'
