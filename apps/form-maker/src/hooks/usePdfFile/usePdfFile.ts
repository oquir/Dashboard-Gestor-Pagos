import { useState } from 'react'
import {
  buildPdfHtml,
  downloadPdfHtml,
  pdfFileName,
  pickLatestPdfFile,
  readPdfFile,
} from '../../lib/pdfFile'
import { renderVerticalTextPng } from '../../lib/pdfVerticalText'
import { usePdfDesignStore } from '../../store/pdfDesignStore'
import type { PdfFileNotice, PdfFileRead } from '../../types'

// Publicar y abrir el .html del PDF sin back: publicar descarga <impuesto>_v<N>.html con la N
// siguiente. El aviso vive en estado local. Las reglas estan en lib/pdfFile.
export function usePdfFile(): {
  notice: PdfFileNotice | null
  dismissNotice: () => void
  publish: () => void
  openFiles: (files: FileList | null) => Promise<void>
} {
  const [notice, setNotice] = useState<PdfFileNotice | null>(null)

  function publish(): void {
    const { design, publishedVersion, markPublished } = usePdfDesignStore.getState()
    if (!design) return

    const version: number = (publishedVersion ?? 0) + 1
    const fileName: string = pdfFileName(design.taxType, version)
    downloadPdfHtml(buildPdfHtml(design, version, renderVerticalTextPng), fileName)
    markPublished(version)
    setNotice({
      tone: 'info',
      title: `Se descargó ${fileName}`,
      details: [
        'Todavía no hay a dónde subirlo: llévalo tú al servidor de las plantillas.',
        `La próxima vez que publiques saldrá la versión ${version + 1}.`,
      ],
    })
  }

  // Con varios archivos vale el de N mas alta. Reemplazar el diseno se deshace, asi que no se
  // confirma.
  async function openFiles(files: FileList | null): Promise<void> {
    const { design, loadDesign } = usePdfDesignStore.getState()
    if (!design || !files || files.length === 0) return

    const list: File[] = [...files]
    const reads: PdfFileRead[] = await Promise.all(
      list.map(async (file) => {
        try {
          return readPdfFile(await file.text(), design.taxType, file.name)
        } catch {
          return { ok: false, error: 'No se pudo leer el archivo.' } satisfies PdfFileRead
        }
      }),
    )
    const failures: string[] = reads.flatMap((read, index) =>
      read.ok ? [] : [list.length > 1 ? `${list[index].name}: ${read.error}` : read.error],
    )

    const chosen: number = pickLatestPdfFile(reads)
    const read: PdfFileRead | undefined = reads[chosen]
    if (!read?.ok) {
      setNotice({
        tone: 'error',
        title:
          list.length === 1
            ? `No se pudo abrir ${list[0].name}`
            : 'No se pudo abrir ningún archivo',
        details: failures,
      })
      return
    }

    loadDesign(read.design, read.version)
    const others: number = reads.filter((item) => item.ok).length - 1
    setNotice({
      tone: 'info',
      title: `Se abrió ${list[chosen].name}${read.version ? ` (versión ${read.version})` : ''}`,
      details: [
        ...(others > 0
          ? [`De los ${others + 1} que se pudieron leer, vale el de versión más alta.`]
          : []),
        ...read.warnings,
        ...failures,
        'Si no era lo que querías, Ctrl+Z vuelve al diseño de antes.',
      ],
    })
  }

  return { notice, dismissNotice: () => setNotice(null), publish, openFiles }
}
