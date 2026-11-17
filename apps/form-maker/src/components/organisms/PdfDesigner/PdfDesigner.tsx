import { useEffect, useMemo } from 'react'
import { ArrowLeft, Moon, Redo, Sun, Undo } from 'reicon-react'
import { useStore } from 'zustand'
import { usePdfDesignAutosave } from '../../../hooks/usePdfDesignAutosave'
import { usePdfDesignerShortcuts } from '../../../hooks/usePdfDesignerShortcuts'
import { readPdfEntryParams, resolvePdfTaxType, taxTypeLabel } from '../../../lib/pdfDesign'
import { useFormStore } from '../../../store'
import { usePdfDesignStore } from '../../../store/pdfDesignStore'
import type { PdfTaxType } from '../../../types'
import { Tooltip } from '../../atoms'
import { PdfCanvas } from '../pdf/PdfCanvas'
import { PdfSidebar } from '../pdf/PdfSidebar'
import {
  EXIT_BUTTON_CLASSES,
  ICON_BUTTON_CLASSES,
  STATUS_DOT_CLASSES,
} from './PdfDesigner.constants'
import { savedStatus } from './PdfDesigner.utils'

// El diseñador del PDF de la declaracion, a pantalla completa como el simulador y cargado aparte
// con React.lazy: la barra lateral a la izquierda, las hojas a la derecha. La plantilla es la del
// impuesto: la que diga la URL (?impuesto=…) si es uno conocido, o si no la del formulario abierto.
// Ver docs/Pendientes-PDF.md.
export function PdfDesigner() {
  const formType = useFormStore((state) => state.setupConfig.formType)
  const setPdfDesignerOpen = useFormStore((state) => state.setPdfDesignerOpen)
  const isDarkMode = useFormStore((state) => state.isDarkMode)
  const toggleDarkMode = useFormStore((state) => state.toggleDarkMode)
  const design = usePdfDesignStore((state) => state.design)
  const lastSavedAt = usePdfDesignStore((state) => state.lastSavedAt)
  const saveError = usePdfDesignStore((state) => state.saveError)
  const openDesign = usePdfDesignStore((state) => state.openDesign)
  const undo = usePdfDesignStore((state) => state.undo)
  const redo = usePdfDesignStore((state) => state.redo)
  const canUndo: boolean = useStore(
    usePdfDesignStore.temporal,
    (temporal) => temporal.pastStates.length > 0,
  )
  const canRedo: boolean = useStore(
    usePdfDesignStore.temporal,
    (temporal) => temporal.futureStates.length > 0,
  )

  // La URL se lee una vez al montar: no cambia mientras el diseñador esta abierto.
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

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface-sunken text-fg">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-6 py-3">
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-fg-strong">Diseñar PDF</h1>
          <p className="truncate text-xs text-fg-muted">
            {taxType ? `${taxTypeLabel(taxType)} · ` : ''}Carta · 5 mm de margen del back
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tooltip content={saveError ?? status.label}>
            <span
              className={`flex items-center gap-1.5 text-[11px] ${
                status.tone === 'error' ? 'text-danger' : 'text-fg-subtle'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASSES[status.tone]}`}
              />
              {status.label}
            </span>
          </Tooltip>
          <div className="flex items-center gap-1">
            <Tooltip content="Deshacer (Ctrl+Z)">
              <span>
                <button
                  type="button"
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="Deshacer"
                  className={`${ICON_BUTTON_CLASSES} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <Undo size={16} />
                </button>
              </span>
            </Tooltip>
            <Tooltip content="Rehacer (Ctrl+Y)">
              <span>
                <button
                  type="button"
                  onClick={redo}
                  disabled={!canRedo}
                  aria-label="Rehacer"
                  className={`${ICON_BUTTON_CLASSES} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <Redo size={16} />
                </button>
              </span>
            </Tooltip>
          </div>
          <Tooltip content={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}>
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
              className={ICON_BUTTON_CLASSES}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </Tooltip>
          <button
            type="button"
            onClick={() => setPdfDesignerOpen(false)}
            className={EXIT_BUTTON_CLASSES}
          >
            <ArrowLeft size={14} />
            Volver al formulario
          </button>
        </div>
      </header>

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
          <main className="min-w-0 flex-1 overflow-auto">
            <PdfCanvas />
          </main>
        </div>
      )}
    </div>
  )
}
