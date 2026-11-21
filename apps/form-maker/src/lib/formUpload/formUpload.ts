// Subida del formulario a la API. Hoy es una peticion FALSA: no sale de la maquina, espera
// FAKE_UPLOAD_DELAY_MS y responde siempre bien. Para conectar el endpoint real se reemplaza solo el
// cuerpo de uploadFormExport (un fetch con el mismo JSON); el boton y los toasts no cambian.
import type { FormExportFile } from '../../types/exportForm'
import type { FormUploadResult } from '../../types/formUpload'
import { FAKE_UPLOAD_DELAY_MS } from './formUpload.constants'

export function uploadFormExport(file: FormExportFile): Promise<FormUploadResult> {
  // Se serializa igual que una peticion real: un formulario que no se pueda serializar falla aca.
  const body: string = JSON.stringify(file)

  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({
        formId: file.projectMeta.formId,
        uploadedAt: new Date().toISOString(),
        bytes: new Blob([body]).size,
      })
    }, FAKE_UPLOAD_DELAY_MS)
  })
}
