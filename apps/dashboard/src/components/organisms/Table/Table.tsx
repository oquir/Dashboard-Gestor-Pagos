import { useTable } from '@tanstack/react-table'
import type { RowData } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, Sort, ChevronLeft, ChevronRight } from 'reicon-react'
import { features } from '../../../lib'
import { Button } from '../../atoms'
import { EmptyState } from '../../molecules'
import type { TableProps } from './Table.types'

export default function Table<T extends RowData>({
  data,
  columns,
  perPage,
  initialOrder = [],
  name,
  empty = 'No hay datos para mostrar',
  dense = false,
  rowId,
  rowClass,
}: TableProps<T>) {
  const table = useTable({
    features: features,
    columns: columns,
    data: data,
    getRowId: rowId ? (row: T) => rowId(row) : undefined,
    initialState: {
      sorting: initialOrder,
      pagination: { pageIndex: 0, pageSize: perPage ?? Number.MAX_SAFE_INTEGER },
    },
  })

  if (data.length === 0) return <EmptyState title={empty} />

  const padding = dense ? 'px-5 py-2' : 'px-5 py-3'
  const total = table.getRowCount()
  const { pageIndex, pageSize } = table.state.pagination
  const from = pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr
                key={group.id}
                className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500"
              >
                {group.headers.map((h) => {
                  const right = h.column.columnDef.meta?.align === 'right'
                  const order = h.column.getIsSorted()
                  return (
                    <th
                      key={h.id}
                      className={`${padding} font-medium ${right ? 'text-right' : ''}`}
                      aria-sort={
                        order === 'asc' ? 'ascending' : order === 'desc' ? 'descending' : undefined
                      }
                    >
                      {h.isPlaceholder ? null : h.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-900 ${right ? 'flex-row-reverse' : ''}`}
                        >
                          <table.FlexRender header={h} />
                          {order === 'asc' ? (
                            <ArrowUp className="size-3.5" aria-hidden />
                          ) : order === 'desc' ? (
                            <ArrowDown className="size-3.5" aria-hidden />
                          ) : (
                            <Sort className="size-3.5 opacity-40" aria-hidden />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={h} />
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={rowClass ? rowClass(row.original) : 'hover:bg-slate-50'}>
                {row.getAllCells().map((cell) => {
                  const meta = cell.column.columnDef.meta
                  return (
                    <td
                      key={cell.id}
                      className={`${padding} ${meta?.align === 'right' ? 'text-right' : ''} ${meta?.classes ?? ''}`}
                    >
                      <table.FlexRender cell={cell} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(name || table.getPageCount() > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            {table.getPageCount() > 1 ? `${from}–${to} de ${total}` : total} {name}
          </span>
          {table.getPageCount() > 1 && (
            <div className="flex items-center gap-1">
              <span className="mr-2">
                Página {pageIndex + 1} de {table.getPageCount()}
              </span>
              <Button
                variant="ghost"
                aria-label="Página anterior"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                aria-label="Página siguiente"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
