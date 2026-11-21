// Subida del formulario a la API: hoy la peticion falsa de lib/fakeApi. Para el endpoint real se
// reemplaza solo este cuerpo (un fetch con el mismo JSON); el boton y los toasts no cambian.
import type { FormExportFile } from '../../types/exportForm'
import type { FakeApiResponse, FormUploadResult } from '../../types/upload'
import { fakeApiPost } from '../fakeApi/fakeApi'

export async function uploadFormExport(file: FormExportFile): Promise<FormUploadResult> {
  // Se serializa igual que una peticion real: un formulario que no se pueda serializar falla aca.
  const response: FakeApiResponse = await fakeApiPost(JSON.stringify(file))
  return { formId: file.projectMeta.formId, ...response }
}
