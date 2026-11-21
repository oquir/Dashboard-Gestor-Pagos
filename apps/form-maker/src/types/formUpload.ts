// Lo que responde la API al subir un formulario.
export interface FormUploadResult {
  formId: string
  uploadedAt: string
  // Tamano del JSON enviado.
  bytes: number
}
