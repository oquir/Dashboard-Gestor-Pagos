import { useTable } from '@tanstack/react-table'
import type { RowData } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, Sort, ChevronLeft, ChevronRight } from 'reicon-react'
import { features } from '../../../lib'
import { Button, Select } from '../../atoms'
import { EmptyState } from '../../molecules'
import type { TableProps } from './Table.types'
import { PAGE_SIZES } from './Table.constants'
import { initialPageSize, visiblePages } from './Table.utils'

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
      pagination: {
        pageIndex: 0,
        pageSize: perPage ? initialPageSize(perPage) : Number.MAX_SAFE_INTEGER,
      },
    },
  })

  if (data.length === 0) return <EmptyState title={empty} />

  const padding = dense ? 'px-5 py-2' : 'px-5 py-3'
  const total = table.getRowCount()
  const { pageIndex, pageSize } = table.state.pagination
  const from = pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)
  const pageCount = table.getPageCount()
  // El selector solo sale en tablas paginadas y si hay más filas que el tamaño más chico.
  const sizes = perPage && total > PAGE_SIZES[0] ? PAGE_SIZES : []

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

      {(name || pageCount > 1 || sizes.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            {sizes.length > 0 && (
              <label className="flex items-center gap-2">
                Mostrar
                <Select
                  className="w-auto! py-1! text-xs!"
                  value={pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                >
                  {sizes.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
                registros
              </label>
            )}
            <span>
              {pageCount > 1 ? `${from}–${to} de ${total}` : total} {name}
            </span>
          </div>
          {pageCount > 1 && (
            <nav aria-label="Paginación" className="flex items-center gap-1">
              <Button
                variant="ghost"
                className="px-2 py-1"
                aria-label="Página anterior"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeft className="size-4" />
              </Button>
              {visiblePages(pageIndex, pageCount).map((p) => (
                <Button
                  key={p}
                  variant={p === pageIndex ? 'primary' : 'ghost'}
                  className="min-w-8 px-2 py-1 text-xs"
                  aria-label={`Página ${p + 1}`}
                  aria-current={p === pageIndex ? 'page' : undefined}
                  onClick={() => table.setPageIndex(p)}
                >
                  {p + 1}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="px-2 py-1"
                aria-label="Página siguiente"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <ChevronRight className="size-4" />
              </Button>
            </nav>
          )}
        </div>
      )}
    </>
  )
}
