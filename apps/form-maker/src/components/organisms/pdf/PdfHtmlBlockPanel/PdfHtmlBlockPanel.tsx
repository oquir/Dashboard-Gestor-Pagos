import {
  PANEL_BUTTON_CLASSES,
  PANEL_DANGER_LINK_CLASSES,
  TEXTAREA_CLASSES,
} from '../../../../constants'
import { canMoveBlock, findBlock } from '../../../../lib/pdfDesignEdit'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import { PanelSection } from '../../../molecules'

// El bloque de HTML libre seleccionado: el escape para lo que el editor visual no sabe hacer. Es el
// lugar natural del <style> de la plantilla (las clases que despues se ponen en celdas y tablas).
export function PdfHtmlBlockPanel() {
  const design = usePdfDesignStore((state) => state.design)
  const selection = usePdfDesignStore((state) => state.selection)
  const setHtmlBlock = usePdfDesignStore((state) => state.setHtmlBlock)
  const moveBlock = usePdfDesignStore((state) => state.moveBlock)
  const removeBlock = usePdfDesignStore((state) => state.removeBlock)

  if (!design || selection?.kind !== 'block') return null
  const location = findBlock(design, selection.blockId)
  if (!location || location.block.kind !== 'html') return null

  const block = location.block

  return (
    <PanelSection
      title="Bloque HTML"
      description="HTML libre, como en las plantillas a mano. Se limpia al pintar y al publicar: se quitan scripts, iframes, formularios, eventos (onclick…) y enlaces javascript:. Se permite <style>, que vale para toda la plantilla."
    >
      <textarea
        aria-label="HTML del bloque"
        value={block.html}
        onChange={(event) => setHtmlBlock(block.id, event.target.value)}
        spellCheck={false}
        placeholder={'<style>.titulo { font-size: 14px; }</style>\n<p class="titulo">…</p>'}
        className={`${TEXTAREA_CLASSES} h-48`}
      />
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => moveBlock(block.id, -1)}
          disabled={!canMoveBlock(design, block.id, -1)}
          className={PANEL_BUTTON_CLASSES}
        >
          Subir
        </button>
        <button
          type="button"
          onClick={() => moveBlock(block.id, 1)}
          disabled={!canMoveBlock(design, block.id, 1)}
          className={PANEL_BUTTON_CLASSES}
        >
          Bajar
        </button>
        <button
          type="button"
          onClick={() => removeBlock(block.id)}
          className={`${PANEL_DANGER_LINK_CLASSES} ml-auto`}
        >
          Quitar bloque
        </button>
      </div>
    </PanelSection>
  )
}
