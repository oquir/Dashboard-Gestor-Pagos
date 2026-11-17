import type { CSSProperties } from 'react'
import { contentBox, fontStack, mmToPx } from '../../../../lib/pdfDesign'
import type { PdfContentBox } from '../../../../types'
import type { PdfSheetViewProps } from './PdfSheetView.types'
import { cellStyle, isSheetEmpty, paperSize } from './PdfSheetView.utils'
import { BACK_MARGIN_PX, EXTRA_MARGIN_GUIDE_CLASSES, PAPER_CLASSES } from './PdfSheetView.constants'

// Una hoja de carta tal como la pondra el back. El papel es blanco y la letra negra tambien en modo
// oscuro, a proposito: es papel, no una superficie de la app. Dos guias: la raya gris son los 5 mm
// fijos del back; la naranja, el margen extra del diseño (solo si hay). El contenido que no cabe se
// recorta en la guia, igual que se perderia al imprimir.
export function PdfSheetView({ sheet, design, index, total }: PdfSheetViewProps) {
  const box: PdfContentBox = contentBox(design.margins)
  const hasExtraMargin: boolean = Object.values(design.margins).some((mm) => mm > 0)

  const contentStyle: CSSProperties = {
    top: mmToPx(design.margins.top),
    right: mmToPx(design.margins.right),
    bottom: mmToPx(design.margins.bottom),
    left: mmToPx(design.margins.left),
  }

  return (
    <figure className="flex flex-col items-center gap-2">
      <div className={PAPER_CLASSES} style={paperSize()}>
        <div
          className="absolute outline-1 outline-dashed outline-slate-300"
          style={{ inset: BACK_MARGIN_PX }}
        >
          <div
            className={`absolute overflow-hidden ${hasExtraMargin ? EXTRA_MARGIN_GUIDE_CLASSES : ''}`}
            style={contentStyle}
          >
            <table
              style={{
                width: box.width,
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
                fontFamily: fontStack(design.fontFamily),
                fontSize: design.fontSize,
              }}
            >
              <tbody>
                {sheet.rows.map((row) => (
                  <tr key={row.id} style={row.height ? { height: row.height } : undefined}>
                    {row.cells.map((cell) => (
                      <td
                        key={cell.id}
                        colSpan={cell.colSpan}
                        rowSpan={cell.rowSpan}
                        style={cellStyle(cell)}
                      >
                        {cell.text}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {isSheetEmpty(sheet) && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                Hoja vacía
              </p>
            )}
          </div>
        </div>
      </div>
      <figcaption className="text-[11px] text-fg-subtle tabular-nums">
        Hoja {index + 1} de {total}
      </figcaption>
    </figure>
  )
}
