// Subir y descargar el .html del PDF (abrir va por usePdfImport). Subir (hoy peticion falsa,
// lib/pdfUpload) es lo que asigna la N: sube <impuesto>_v<N+1>.html y la marca al responder bien.
// Descargar es una copia que no gasta N: lleva la ultima subida, o _borrador si nunca se subio. Las
// reglas estan en lib/pdfFile.
import { toast } from 'sonner'
import { describeApiError } from '../../lib/fakeApi/fakeApi'
import { buildPdfHtml, downloadPdfHtml, pdfFileName } from '../../lib/pdfFile'
import { uploadPdfHtml } from '../../lib/pdfUpload'
import { renderVerticalTextPng } from '../../lib/pdfVerticalText'
import { usePdfDesignStore } from '../../store/pdfDesignStore'
import type { PdfDesignState } from '../../types'
import { PDF_FILE_COPY } from './usePdfFile.constants'
import type { UsePdfFileResult } from './usePdfFile.types'
import { describePdfUpload } from './usePdfFile.utils'

export function usePdfFile(): UsePdfFileResult {
  const isUploading: boolean = usePdfDesignStore((state) => state.isUploading)

  function upload(): void {
    const state: PdfDesignState = usePdfDesignStore.getState()
    if (!state.design || state.isUploading) return

    const version: number = (state.publishedVersion ?? 0) + 1
    const fileName: string = pdfFileName(state.design.taxType, version)
    const html: string = buildPdfHtml(state.design, version, renderVerticalTextPng)

    state.setUploading(true)
    const toastId: string | number = toast.loading(PDF_FILE_COPY.uploading, {
      description: PDF_FILE_COPY.uploadingDescription,
    })

    uploadPdfHtml(html, fileName, version)
      .then((result) => {
        usePdfDesignStore.getState().markPublished(result.version)
        toast.success(`${PDF_FILE_COPY.uploaded} · v${result.version}`, {
          id: toastId,
          description: describePdfUpload(result),
        })
      })
      .catch((error: unknown) => {
        toast.error(PDF_FILE_COPY.uploadFailed, {
          id: toastId,
          description: describeApiError(error),
        })
      })
      .finally(() => usePdfDesignStore.getState().setUploading(false))
  }

  function download(): void {
    const { design, publishedVersion } = usePdfDesignStore.getState()
    if (!design) return

    const fileName: string = pdfFileName(design.taxType, publishedVersion)
    downloadPdfHtml(buildPdfHtml(design, publishedVersion, renderVerticalTextPng), fileName)
    toast.success(`Se descargó ${fileName}`, { description: PDF_FILE_COPY.downloadedDescription })
  }

  return { isUploading, upload, download }
}
