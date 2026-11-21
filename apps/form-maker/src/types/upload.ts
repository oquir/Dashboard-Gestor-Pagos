// Lo que responde la API a una subida (hoy la peticion falsa de lib/fakeApi).
export interface FakeApiResponse {
  uploadedAt: string
  // Tamano del cuerpo enviado.
  bytes: number
}

export interface FormUploadResult extends FakeApiResponse {
  formId: string
}

export interface PdfUploadResult extends FakeApiResponse {
  fileName: string
  version: number
}
