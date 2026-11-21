import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CloudUpload, DocumentDownload2, FolderOpen, Moon, Sun } from 'reicon-react'
import { useCanvasPan } from '../../../hooks'
import { usePdfDesignAutosave } from '../../../hooks/usePdfDesignAutosave'
import { usePdfDesignerShortcuts } from '../../../hooks/usePdfDesignerShortcuts'
import { usePdfFile } from '../../../hooks/usePdfFile'
import { readPdfEntryParams, resolvePdfTaxType, taxTypeLabel } from '../../../lib/pdfDesign'
import { useFormStore } from '../../../store'
import { usePdfDesignStore } from '../../../store/pdfDesignStore'
import type { PdfTaxType } from '../../../types'
import { Spinner, Tooltip } from '../../atoms'
import { PdfCanvas } from '../pdf/PdfCanvas'
import { PdfImportModal } from '../pdf/PdfImportModal'
import { PdfSidebar } from '../pdf/PdfSidebar'
import { PdfToolbar } from '../pdf/PdfToolbar'
import {
  BACK_BUTTON_CLASSES,
  DOWNLOAD_BUTTON_CLASSES,
  HAND_CURSOR_CLASSES,
  OPEN_BUTTON_CLASSES,
  STATUS_DOT_CLASSES,
  THEME_BUTTON_CLASSES,
  UPLOAD_BUTTON_CLASSES,
} from './PdfDesigner.constants'
import { savedStatus } from './PdfDesigner.utils'

// A pantalla completa y en su propio chunk. La plantilla es la del impuesto de la URL (?impuesto=)
// o, si no, la del formulario abierto.
export function PdfDesigner() {
  const formType = useFormStore((state) => state.setupConfig.formType)
  const setPdfDesignerOpen = useFormStore((state) => state.setPdfDesignerOpen)
  const isDarkMode = useFormStore((state) => state.isDarkMode)
  const toggleDarkMode = useFormStore((state) => state.toggleDarkMode)
  const design = usePdfDesignStore((state) => state.design)
  const lastSavedAt = usePdfDesignStore((state) => state.lastSavedAt)
  const saveError = usePdfDesignStore((state) => state.saveError)
  const publishedVersion = usePdfDesignStore((state) => state.publishedVersion)
  const openDesign = usePdfDesignStore((state) => state.openDesign)
  const [isImportOpen, setImportOpen] = useState<boolean>(false)
  const { isUploading, upload, download } = usePdfFile()
  const tool = usePdfDesignStore((state) => state.tool)

  // La URL se lee una vez al montar.
  const taxType: PdfTaxType | null = useMemo(
    () => resolvePdfTaxType(formType, readPdfEntryParams(window.location.search)),
    [formType],
  )

  usePdfDesignAutosave()
  usePdfDesignerShortcuts()

  useEffect(() => {
    if (taxType) openDesign(taxType)
  }, [taxType, openDesign])

  const status = savedStatus(lastSavedAt, saveError)
  const isReady: boolean = design !== null && design.taxType === taxType

  // La mano desplaza el <main> (data-canvas-scroll), solo con las hojas montadas.
  useCanvasPan(isReady && tool === 'hand')

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface-sunken text-fg">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-6 py-2">
        <div className="flex min-w-0 items-center gap-4">
          <Tooltip content="Volver al formulario">
            <button
              type="button"
              onClick={() => setPdfDesignerOpen(false)}
              className={BACK_BUTTON_CLASSES}
            >
              <ArrowLeft size={14} />
              Volver
            </button>
          </Tooltip>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-fg-strong">Diseñar PDF</h1>
            <p className="truncate text-xs text-fg-muted">
              {taxType ? `${taxTypeLabel(taxType)} · ` : ''}Carta · 5 mm de margen del back ·{' '}
              {publishedVersion ? `Última versión subida: ${publishedVersion}` : 'Sin subir'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tooltip content={saveError ?? status.label}>
            <span
              className={`flex items-center gap-1.5 text-[11px] ${
                status.tone === 'error' ? 'text-danger' : 'text-fg-muted'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASSES[status.tone]}`}
              />
              {status.label}
            </span>
          </Tooltip>
          <Tooltip content={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}>
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
              className={THEME_BUTTON_CLASSES}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </Tooltip>
          {isReady && (
            <div className="flex items-center gap-1.5">
              <Tooltip content="Abre un .html de FormMaker o una plantilla hecha a mano. Con varios, vale el de versión más alta.">
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  className={OPEN_BUTTON_CLASSES}
                >
                  <FolderOpen size={14} />
                  Abrir…
                </button>
              </Tooltip>
              <Tooltip content="Descarga una copia del .html del diseño actual. No gasta versión.">
                <button type="button" onClick={download} className={DOWNLOAD_BUTTON_CLASSES}>
                  <DocumentDownload2 size={14} />
                  Descargar HTML
                </button>
              </Tooltip>
              <Tooltip
                content={
                  isUploading
                    ? 'Subiendo la plantilla…'
                    : `Sube el .html a la API como versión ${(publishedVersion ?? 0) + 1}`
                }
              >
                <button
                  type="button"
                  onClick={upload}
                  disabled={isUploading}
                  aria-busy={isUploading}
                  className={UPLOAD_BUTTON_CLASSES}
                >
                  {isUploading ? <Spinner className="size-[13px]" /> : <CloudUpload size={13} />}
                  Subir v{(publishedVersion ?? 0) + 1}
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </header>

      {isImportOpen && <PdfImportModal onClose={() => setImportOpen(false)} />}

      {!taxType && (
        <p className="mx-auto mt-16 max-w-md px-6 text-center text-sm text-fg-muted">
          Este formulario no tiene impuesto definido, así que no hay plantilla que abrir. Cada
          impuesto tiene la suya.
        </p>
      )}

      {isReady && (
        <div className="flex min-h-0 flex-1">
          <aside className="w-80 shrink-0 overflow-y-auto border-r border-border bg-surface">
            <PdfSidebar />
          </aside>
          {/* La barra cuelga de este contenedor y no del <main> que hace scroll: queda quieta
              sobre las hojas. */}
          <div className="relative flex min-w-0 flex-1 flex-col">
            <main
              data-canvas-scroll
              className={`min-h-0 flex-1 overflow-auto ${tool === 'hand' ? HAND_CURSOR_CLASSES : ''}`}
            >
              <PdfCanvas />
            </main>
            <PdfToolbar />
          </div>
        </div>
      )}
    </div>
  )
}
