import { useState } from 'react'
import { saveDraft } from '../../lib'
import { readProjectFile, summarizeProjectFile } from '../../lib'
import { useFormStore } from '../../store'
import type { ProjectFileLoad, ProjectFileSummary } from '../../types'
import { UNREADABLE_FILE_MESSAGE } from './useProjectImport.constants'
import type { UseProjectImportResult } from './useProjectImport.types'

// Abrir un formulario exportado: lee, muestra que trae y lo carga al confirmar. Lo comparten el
// asistente y el panel derecho; lectura y validacion en lib/projectFile.
export function useProjectImport(): UseProjectImportResult {
  const restoreDraft = useFormStore((state) => state.restoreDraft)
  const markSaved = useFormStore((state) => state.markSaved)
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<ProjectFileLoad | null>(null)
  const [isReading, setIsReading] = useState<boolean>(false)

  async function pickFile(file: File): Promise<void> {
    setFileName(file.name)
    setIsReading(true)

    try {
      const text: string = await file.text()
      setResult(readProjectFile(text))
    } catch {
      // Un archivo que se movio despues de elegirlo, o que el navegador no deja leer.
      setResult({ status: 'error', message: UNREADABLE_FILE_MESSAGE })
    } finally {
      setIsReading(false)
    }
  }

  function openProject(): void {
    if (result?.status !== 'ok') return

    const { draft } = result
    restoreDraft(draft)
    // Se guarda en el acto: recargar antes del autoguardado devolveria el borrador anterior.
    saveDraft({
      formSteps: draft.formSteps,
      introModal: draft.introModal,
      formScript: draft.formScript,
      setupConfig: draft.setupConfig,
    })
    markSaved()
  }

  const summary: ProjectFileSummary | null =
    result?.status === 'ok' ? summarizeProjectFile(result.draft) : null

  return {
    fileName,
    result,
    summary,
    isReading,
    canOpen: result?.status === 'ok' && !isReading,
    pickFile,
    openProject,
  }
}
