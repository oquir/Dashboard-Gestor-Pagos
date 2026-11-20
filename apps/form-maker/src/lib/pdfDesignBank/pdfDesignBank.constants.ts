// Una llave por impuesto, aparte del borrador: el PDF nunca entra al borrador ni al export. Prefijo
// viejo, como las demas.
export const PDF_DESIGN_KEY_PREFIX: string = 'form-orchestrator-pdf-'

// Sube con cada cambio de forma, junto con su migracion. 2: la hoja pasa a lista de bloques.
// Componentes y clases no la subieron (variante nueva; .default([])).
export const PDF_DESIGN_SCHEMA_VERSION: number = 2

export const QUOTA_MESSAGE: string =
  'No cupo en el almacenamiento del navegador (unos 5 MB). Las imágenes en base64 son lo que más pesa: pásalas a URL.'

export const SAVE_FAILED_MESSAGE: string = 'No se pudo guardar el diseño en el navegador.'
