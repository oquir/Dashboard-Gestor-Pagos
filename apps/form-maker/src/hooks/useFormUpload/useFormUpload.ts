// Sube el formulario a la API (lib/formUpload) y cuenta la espera con un toast que pasa de cargando
// a listo. Corre despues de la revision (useExportReview). El en-curso vive en el store y no aca: si
// se pliega el panel a mitad de la subida, el boton del chip tiene que seguir bloqueado.
import { toast } from 'sonner'
import { buildFormExportFile } from '../../lib/exportForm/exportForm'
import { uploadFormExport } from '../../lib/formUpload/formUpload'
import { useFormStore } from '../../store/formStore'
import type { FormExportFile } from '../../types/exportForm'
import type { FormState } from '../../types/formStoreTypes'
import type { FormUploadResult } from '../../types/formUpload'
import { UPLOAD_TOAST_COPY } from './useFormUpload.constants'
import type { UseFormUploadResult } from './useFormUpload.types'
import { describeUpload, describeUploadError } from './useFormUpload.utils'

export function useFormUpload(): UseFormUploadResult {
  const isUploading: boolean = useFormStore((state) => state.isUploadingForm)

  function upload(): void {
    const state: FormState = useFormStore.getState()
    if (state.isUploadingForm) return

    state.setUploadingForm(true)
    const toastId: string | number = toast.loading(UPLOAD_TOAST_COPY.loading, {
      description: UPLOAD_TOAST_COPY.loadingDescription,
    })

    // Se arma dentro de la promesa: un fallo al compilar tambien termina en el toast de error.
    const request: Promise<FormUploadResult> = Promise.resolve().then(() => {
      const file: FormExportFile = buildFormExportFile(
        state.formSteps,
        state.setupConfig,
        state.introModal.steps,
        state.formScript,
      )
      return uploadFormExport(file)
    })

    request
      .then((result) => {
        toast.success(UPLOAD_TOAST_COPY.success, {
          id: toastId,
          description: describeUpload(result),
        })
      })
      .catch((error: unknown) => {
        toast.error(UPLOAD_TOAST_COPY.error, {
          id: toastId,
          description: describeUploadError(error),
        })
      })
      .finally(() => useFormStore.getState().setUploadingForm(false))
  }

  return { isUploading, upload }
}
