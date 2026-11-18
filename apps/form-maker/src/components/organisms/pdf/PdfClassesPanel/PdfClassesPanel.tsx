import { useMemo, useState } from 'react'
import {
  ADD_LINK_CLASSES,
  ERROR_CLASSES,
  INPUT_CLASSES,
  PANEL_BUTTON_CLASSES,
  PANEL_BUTTON_ON_CLASSES,
  PANEL_DANGER_LINK_CLASSES,
  TEXTAREA_CLASSES,
} from '../../../../constants'
import { isValidPdfClassName } from '../../../../lib/pdfDesign'
import { classUsage } from '../../../../lib/pdfDesignEdit'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import type { PdfClass } from '../../../../types'
import { Label } from '../../../atoms'
import { PanelSection } from '../../../molecules'
import { PdfStyleFields } from '../PdfStyleFields'
import { NO_STYLE } from './PdfClassesPanel.constants'

// Las clases del diseño: un estilo con nombre que llevan muchas celdas. En el .html sale una vez, en
// el <style> del documento, y cada celda dice solo class="…" (antes cada <td> repetia su style
// entero). Se editan con los mismos botones que una celda; el orden de la lista es el del <style>,
// asi que con dos clases que digan lo mismo gana la de mas abajo.
export function PdfClassesPanel() {
  const design = usePdfDesignStore((state) => state.design)
  const editingClass = usePdfDesignStore((state) => state.editingClass)
  const setEditingClass = usePdfDesignStore((state) => state.setEditingClass)
  const addClass = usePdfDesignStore((state) => state.addClass)
  const updateClass = usePdfDesignStore((state) => state.updateClass)
  const renameClass = usePdfDesignStore((state) => state.renameClass)
  const removeClass = usePdfDesignStore((state) => state.removeClass)
  // El nombre mientras se escribe: se aplica al salir del campo o con Enter, para no renombrar las
  // celdas en cada tecla ni pasar por nombres a medias.
  const [draft, setDraft] = useState<{ for: string; value: string } | null>(null)
  const usage: Map<string, number> = useMemo(
    () => (design ? classUsage(design) : new Map()),
    [design],
  )
  if (!design) return null

  const current: PdfClass | undefined = design.classes.find((item) => item.name === editingClass)
  const name: string =
    draft && current && draft.for === current.name ? draft.value : (current?.name ?? '')
  const nameError: string | null =
    !current || name === current.name
      ? null
      : !isValidPdfClassName(name)
        ? 'Letras, números, guion o guion bajo, sin espacios; no puede empezar con número ni con fm-.'
        : design.classes.some((item) => item.name === name)
          ? 'Ya hay una clase con ese nombre.'
          : null

  function commitName(): void {
    if (current && !nameError && name !== current.name) renameClass(current.name, name)
    setDraft(null)
  }

  return (
    <PanelSection
      title="Clases del diseño"
      description="Un estilo con nombre para muchas celdas: en el HTML sale una sola vez y cada celda dice solo su nombre, así el archivo queda corto. Con dos clases que digan lo mismo, gana la de más abajo en esta lista."
    >
      <div className="flex flex-wrap gap-1.5">
        {design.classes.map((item) => (
          <button
            key={item.name}
            type="button"
            aria-pressed={item.name === editingClass}
            onClick={() => setEditingClass(item.name === editingClass ? null : item.name)}
            className={`${PANEL_BUTTON_CLASSES} font-mono ${item.name === editingClass ? PANEL_BUTTON_ON_CLASSES : ''}`}
          >
            {item.name}
            <span className="font-sans text-[10px] text-fg-subtle tabular-nums">
              {usage.get(item.name) ?? 0}
            </span>
          </button>
        ))}
      </div>
      <button type="button" onClick={() => addClass()} className={`${ADD_LINK_CLASSES} self-start`}>
        + Clase
      </button>

      {current && (
        <div className="flex flex-col gap-3 rounded-md border border-border p-2 dark:bg-black/10">
          <div>
            <Label htmlFor="pdf-class-name" className="text-[11px]">
              Nombre
            </Label>
            <input
              id="pdf-class-name"
              value={name}
              onChange={(event) =>
                setDraft({ for: current.name, value: event.target.value.trim() })
              }
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitName()
                if (event.key === 'Escape') setDraft(null)
              }}
              spellCheck={false}
              className={`${INPUT_CLASSES} font-mono`}
            />
            {nameError ? (
              <p className={`${ERROR_CLASSES} mt-1`}>{nameError}</p>
            ) : (
              <p className="mt-1 text-[11px] text-fg-subtle">
                En {usage.get(current.name) ?? 0} celdas. Cambiar el nombre lo cambia también en
                ellas.
              </p>
            )}
          </div>

          <PdfStyleFields
            idPrefix="pdf-class"
            value={current}
            inherited={NO_STYLE}
            defaultFontSize={design.fontSize}
            onChange={(patch) => updateClass(current.name, patch)}
          />

          <div>
            <Label htmlFor="pdf-class-css" className="text-[11px]">
              CSS de la clase
            </Label>
            <textarea
              id="pdf-class-css"
              value={current.css ?? ''}
              onChange={(event) =>
                updateClass(current.name, { css: event.target.value || undefined })
              }
              spellCheck={false}
              placeholder="padding-left: 12px;"
              className={`${TEXTAREA_CLASSES} h-16`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditingClass(null)}
              className={PANEL_BUTTON_CLASSES}
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => removeClass(current.name)}
              className={`${PANEL_DANGER_LINK_CLASSES} ml-auto`}
            >
              Quitar la clase de todas sus celdas
            </button>
          </div>
        </div>
      )}
    </PanelSection>
  )
}
