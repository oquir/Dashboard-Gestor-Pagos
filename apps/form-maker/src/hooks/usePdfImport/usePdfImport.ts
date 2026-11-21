// Abrir un .html en el disenador de PDF desde su modal (PdfImportModal): lee lo elegido, muestra
// que trae y lo carga al confirmar. Con varios archivos vale el de N mas alta. Abrir es un paso de
// deshacer, asi que no se pide mas confirmacion que la del modal. Fuera de hooks/index.ts: solo lo
// usa el chunk del PDF. Lectura y reglas en lib/pdfFile.
import { useState } from 'react'
import { toast } from 'sonner'
import { pickLatestPdfFile, readPdfFile } from '../../lib/pdfFile'
import { usePdfDesignStore } from '../../store/pdfDesignStore'
import type { PdfDesign, PdfFileRead, PdfImportChoice, UsePdfImportResult } from '../../types'
import { PDF_IMPORT_COPY } from './usePdfImport.constants'

export function usePdfImport(): UsePdfImportResult {
  const [fileNames, setFileNames] = useState<string[]>([])
  const [reads, setReads] = useState<PdfFileRead[]>([])
  const [isReading, setIsReading] = useState<boolean>(false)

  async function pickFiles(files: File[]): Promise<void> {
    const design: PdfDesign | null = usePdfDesignStore.getState().design
    if (!design) return

    setFileNames(files.map((file) => file.name))
    setIsReading(true)
    const next: PdfFileRead[] = await Promise.all(
      files.map(async (file) => {
        try {
          return readPdfFile(await file.text(), design.taxType, file.name)
        } catch {
          return { ok: false, error: PDF_IMPORT_COPY.unreadable } satisfies PdfFileRead
        }
      }),
    )
    setReads(next)
    setIsReading(false)
  }

  const chosenIndex: number = pickLatestPdfFile(reads)
  const chosenRead: PdfFileRead | undefined = reads[chosenIndex]
  const choice: PdfImportChoice | null =
    chosenRead?.ok === true
      ? {
          fileName: fileNames[chosenIndex],
          read: chosenRead,
          readableCount: reads.filter((read) => read.ok).length,
        }
      : null
  const failures: string[] = reads.flatMap((read, index) =>
    read.ok ? [] : [reads.length > 1 ? `${fileNames[index]}: ${read.error}` : read.error],
  )

  function openChosen(): void {
    if (!choice) return

    usePdfDesignStore.getState().loadDesign(choice.read.design, choice.read.version)
    const version: string = choice.read.version ? ` (versión ${choice.read.version})` : ''
    toast.success(`Se abrió ${choice.fileName}${version}`, {
      description: PDF_IMPORT_COPY.undoHint,
    })
  }

  const status: string = isReading
    ? 'Leyendo…'
    : fileNames.length === 0
      ? 'Ningún archivo elegido'
      : fileNames.length === 1
        ? fileNames[0]
        : `${fileNames.length} archivos`

  return {
    status,
    choice,
    failures,
    isReading,
    canOpen: choice !== null && !isReading,
    pickFiles,
    openChosen,
  }
}
