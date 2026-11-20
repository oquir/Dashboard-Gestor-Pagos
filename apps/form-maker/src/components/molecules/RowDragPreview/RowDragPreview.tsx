import { FieldTypeBadge } from '../../atoms'
import { FieldPreviewControl } from '../FieldPreviewControl'
import type { RowDragPreviewProps } from './RowDragPreview.types'

export function RowDragPreview({ row, width, scale }: RowDragPreviewProps) {
  return (
    <div
      style={{
        width,
        gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))`,
        // El overlay vive fuera del contenedor escalado: la replica se escala sola, con el ancho de
        // maquetacion de measureRow (con el visual el zoom se aplicaria dos veces).
        transform: scale === 1 ? undefined : `scale(${scale})`,
        transformOrigin: 'top left',
      }}
      className="grid rotate-1 gap-3 rounded-md border-2 border-brand bg-white p-3 shadow-2xl dark:bg-neutral-900"
    >
      {row.fields.length === 0 && (
        <div
          style={{ gridColumn: `span ${row.columns} / span ${row.columns}` }}
          className="flex h-16 items-center justify-center text-sm text-fg-muted"
        >
          Fila vacía
        </div>
      )}

      {row.fields.map((field) => (
        <div
          key={field.id}
          style={{
            gridColumn: `${field.colStart} / span ${field.colSpan}`,
            gridRow: 1,
            marginTop: field.styles.marginTop,
            marginBottom: field.styles.marginBottom,
            backgroundColor: field.styles.backgroundColor,
            color: field.styles.textColor,
          }}
          className="flex min-w-0 flex-col gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
        >
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <p className="truncate text-sm font-medium text-slate-700 dark:text-neutral-200">
              {field.label}
            </p>
            <FieldTypeBadge type={field.type} />
          </div>
          <FieldPreviewControl field={field} />
        </div>
      ))}
    </div>
  )
}
