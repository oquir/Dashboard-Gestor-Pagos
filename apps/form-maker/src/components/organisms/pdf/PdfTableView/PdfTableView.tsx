import type { MouseEvent, ReactNode } from 'react'
import { PDF_CANVAS_CLASS, PDF_VARIABLE_PATTERN } from '../../../../constants'
import { cellStyleMap, tableStyleMap } from '../../../../lib/pdfDesign'
import { sanitizePdfHtml } from '../../../../lib/pdfHtml'
import type { PdfCell } from '../../../../types'
import type { PdfTableViewProps } from './PdfTableView.types'

// Una tabla del diseño, pintada como saldra en el PDF, mas lo minimo para editarla: clic selecciona
// una celda, Shift+clic agranda la seleccion. Se llama a si misma para las tablas anidadas; el clic
// de una celda de adentro no sube a la de afuera.
export function PdfTableView({ table, selectedIds, onSelectCell }: PdfTableViewProps) {
  function handleClick(event: MouseEvent<HTMLTableCellElement>, cell: PdfCell): void {
    event.stopPropagation()
    onSelectCell(table.id, cell.id, event.shiftKey)
  }

  return (
    <table className={table.className} style={tableStyleMap(table)}>
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
              if (cell.content.kind === 'html') {
                return (
                  <td
                    key={cell.id}
                    colSpan={cell.colSpan}
                    rowSpan={cell.rowSpan}
                    className={className}
                    style={cellStyleMap(cell)}
                    onClick={(event) => handleClick(event, cell)}
                    dangerouslySetInnerHTML={{
                      __html: sanitizePdfHtml(cell.content.html) || '&nbsp;',
                    }}
                  />
                )
              }

              return (
                <td
                  key={cell.id}
                  colSpan={cell.colSpan}
                  rowSpan={cell.rowSpan}
                  className={className}
                  style={cellStyleMap(cell)}
                  onClick={(event) => handleClick(event, cell)}
                >
                  {cell.content.kind === 'table' ? (
                    <PdfTableView
                      table={cell.content.table}
                      selectedIds={selectedIds}
                      onSelectCell={onSelectCell}
                    />
                  ) : (
                    renderText(cell.content.text)
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
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
