import { useCanvasReveal } from '../../../hooks/useCanvasReveal/useCanvasReveal'
import { getActiveRows, useFormStore } from '../../../store/formStore'
import type { CanvasRow, FieldTypeDef } from '../../../types'
import { PaletteChip } from '../../molecules'
import {
  PALETTE_SECTIONS,
  SECTION_GRID_CLASSES,
  SECTION_HEADING_CLASSES,
} from './FieldPalette.constants'

export function FieldPalette() {
  const appendFieldToActiveCanvas = useFormStore((state) => state.appendFieldToActiveCanvas)
  const setCanvasViewMode = useFormStore((state) => state.setCanvasViewMode)
  const reveal = useCanvasReveal()

  function handleAdd(fieldType: FieldTypeDef): void {
    if (useFormStore.getState().canvasViewMode !== 'canvas') setCanvasViewMode('canvas')

    const before: number = getActiveRows(useFormStore.getState()).length
    appendFieldToActiveCanvas(fieldType)

    const rows: CanvasRow[] = getActiveRows(useFormStore.getState())
    if (rows.length > before) reveal({ kind: 'row', id: rows[rows.length - 1].id })
  }

  return (
    <div className="flex flex-col gap-4">
      {PALETTE_SECTIONS.map((section) => (
        <section key={section.category} aria-labelledby={`palette-${section.category}`}>
          <h3 id={`palette-${section.category}`} className={SECTION_HEADING_CLASSES}>
            {section.heading}
          </h3>
          <ul className={SECTION_GRID_CLASSES}>
            {section.fieldTypes.map((fieldType) => (
              <li key={fieldType.type}>
                <PaletteChip fieldType={fieldType} onAdd={handleAdd} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
