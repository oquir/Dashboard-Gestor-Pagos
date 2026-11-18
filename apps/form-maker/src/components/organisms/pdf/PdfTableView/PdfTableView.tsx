import type { MouseEvent, ReactNode } from 'react'
import {
  PDF_CANVAS_ATTRIBUTE,
  PDF_CANVAS_CLASS,
  PDF_TABLE_CLASS,
  PDF_VARIABLE_PATTERN,
} from '../../../../constants'
import { pdfComponentHtml } from '../../../../lib/pdfComponents'
import { cellStyleMap, tableStyleMap } from '../../../../lib/pdfDesign'
import { sanitizePdfHtml } from '../../../../lib/pdfHtml'
import { renderVerticalTextPng } from '../../../../lib/pdfVerticalText'
import type { PdfCell, PdfCellContent } from '../../../../types'
import type { PdfTableViewProps } from './PdfTableView.types'

// Una tabla del diseño, pintada como saldra en el PDF, mas lo minimo para editarla: clic selecciona
// una celda, Shift+clic agranda la seleccion. Se llama a si misma para las tablas anidadas; el clic
// de una celda de adentro no sube a la de afuera.
export function PdfTableView({ table, fontFamily, selectedIds, onSelectCell }: PdfTableViewProps) {
  function handleClick(event: MouseEvent<HTMLTableCellElement>, cell: PdfCell): void {
    event.stopPropagation()
    onSelectCell(table.id, cell.id, event.shiftKey)
  }

  // El HTML de la celda cuando no es texto ni tabla: el libre o el de su componente, saneado igual
  // que al publicar.
  function cellHtml(content: PdfCellContent): string | null {
    if (content.kind === 'html') return sanitizePdfHtml(content.html) || '&nbsp;'
    if (content.kind === 'component') {
      const html: string = pdfComponentHtml(content.component, {
        mode: 'canvas',
        fontFamily,
        renderVerticalText: renderVerticalTextPng,
      })
      return sanitizePdfHtml(html) || '&nbsp;'
    }
    return null
  }

  return (
    <table
      className={[PDF_TABLE_CLASS, table.className].filter(Boolean).join(' ')}
      style={tableStyleMap(table)}
    >
      <colgroup>
        {table.columns.map((column) => (
          <col key={column.id} style={column.width ? { width: column.width } : undefined} />
        ))}
      </colgroup>
      <tbody>
        {table.rows.map((row) => (
          <tr key={row.id} style={row.height ? { height: row.height } : undefined}>
            {row.cells.map((cell) => {
              const className: string = [
                cell.className,
                PDF_CANVAS_CLASS.cell,
                selectedIds.has(cell.id) ? PDF_CANVAS_CLASS.selected : '',
              ]
                .filter(Boolean)
                .join(' ')

              // El HTML libre va saneado, y dentro del shadow root: su <style> no alcanza a la app.
              const html: string | null = cellHtml(cell.content)
              if (html !== null) {
                return (
                  <td
                    key={cell.id}
                    {...cellAttributes(table.id, cell.id)}
                    colSpan={cell.colSpan}
                    rowSpan={cell.rowSpan}
                    className={className}
                    style={cellStyleMap(cell)}
                    onClick={(event) => handleClick(event, cell)}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                )
              }

              return (
                <td
                  key={cell.id}
                  {...cellAttributes(table.id, cell.id)}
                  colSpan={cell.colSpan}
                  rowSpan={cell.rowSpan}
                  className={className}
                  style={cellStyleMap(cell)}
                  onClick={(event) => handleClick(event, cell)}
                >
                  {cell.content.kind === 'table' ? (
                    <PdfTableView
                      table={cell.content.table}
                      fontFamily={fontFamily}
                      selectedIds={selectedIds}
                      onSelectCell={onSelectCell}
                    />
                  ) : cell.content.kind === 'text' ? (
                    renderText(cell.content.text)
                  ) : null}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Lo que el arrastre de la seleccion multiple lee para saber en que celda esta el puntero.
function cellAttributes(tableId: string, cellId: string): Record<string, string> {
  return { [PDF_CANVAS_ATTRIBUTE.table]: tableId, [PDF_CANVAS_ATTRIBUTE.cell]: cellId }
}

// Las {variables} van resaltadas para que se vean entre el texto fijo. Una celda vacia lleva un
// espacio duro: sin el, la fila se aplasta y no hay donde hacer clic.
function renderText(text: string): ReactNode {
  if (text === '') return ' '

  return text.split(PDF_VARIABLE_PATTERN).map((part, index) =>
    PDF_VARIABLE_PATTERN.test(part) ? (
      <span key={index} className={PDF_CANVAS_CLASS.variable}>
        {part}
      </span>
    ) : (
      part
    ),
  )
}
