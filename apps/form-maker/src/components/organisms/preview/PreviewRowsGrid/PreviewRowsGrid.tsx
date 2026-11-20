import type { CSSProperties } from 'react'
import { PREVIEW_ROW_STACK_CLASSES } from '../../../../constants'
import { fieldKey } from '../../../../lib/runtimeValidation/runtimeValidation.utils'
import { PreviewField } from '../PreviewField'
import type { PreviewRowsGridProps } from './PreviewRowsGrid.types'

export function PreviewRowsGrid({
  rows,
  scope,
  preview,
  groupId,
  itemIndex,
}: PreviewRowsGridProps) {
  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => {
        // Una fila sin campos visibles dejaria su gap en el flex.
        if (!row.fields.some((field) => scope.visible[field.name])) return null

        return (
          <div
            key={row.rowId}
            className={`grid items-start gap-3 ${PREVIEW_ROW_STACK_CLASSES}`}
            style={
              {
                // gridTemplateColumns al final para ganarle al CSS libre.
                ...row.styles,
                gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))`,
              } as CSSProperties
            }
          >
            {/* Apilada en celular la fila sigue el orden del DOM: se ordena por colStart. */}
            {[...row.fields]
              .sort((a, b) => a.colStart - b.colStart)
              .map((field) => {
                const key: string = fieldKey(field.name, groupId, itemIndex)

                return (
                  <PreviewField
                    key={field.fieldId}
                    field={field}
                    scope={scope}
                    catalogBank={preview.catalogBank}
                    externalLabel={preview.model.externalLabels.get(field.name)}
                    linkedTooltip={
                      field.labelFor
                        ? preview.model.fieldsByName.get(field.labelFor)?.tooltip
                        : undefined
                    }
                    error={preview.revealed[key] ? preview.errors[key] : undefined}
                    onChange={(value) => preview.setValue(field.name, value, groupId, itemIndex)}
                  />
                )
              })}
          </div>
        )
      })}
    </div>
  )
}
