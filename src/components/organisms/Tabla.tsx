import { useTable } from '@tanstack/react-table'
import type { RowData } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, Sort, ChevronLeft, ChevronRight } from 'reicon-react'
import { caracteristicas } from '../../lib/tabla'
import type { Columnas } from '../../lib/tabla'
import { Boton } from '../atoms'
import { Vacio } from '../molecules'

interface Props<T extends RowData> {
  datos: T[]
  /** Deben ser estables (módulo o useMemo), como pide TanStack Table. */
  columnas: Columnas<T>
  /** Sin valor, la tabla muestra todas las filas. */
  porPagina?: number
  ordenInicial?: { id: string; desc: boolean }[]
  /** Texto del pie, por ejemplo "inscripciones". */
  nombre?: string
  vacio?: string
  densa?: boolean
  idFila?: (fila: T) => string
  claseFila?: (fila: T) => string
}

export default function Tabla<T extends RowData>({
  datos,
  columnas,
  porPagina,
  ordenInicial = [],
  nombre,
  vacio = 'No hay datos para mostrar',
  densa = false,
  idFila,
  claseFila,
}: Props<T>) {
  const tabla = useTable({
    features: caracteristicas,
    columns: columnas,
    data: datos,
    getRowId: idFila ? (fila: T) => idFila(fila) : undefined,
    initialState: { sorting: ordenInicial, pagination: { pageIndex: 0, pageSize: porPagina ?? Number.MAX_SAFE_INTEGER } },
  })

  if (datos.length === 0) return <Vacio titulo={vacio} />

  const relleno = densa ? 'px-5 py-2' : 'px-5 py-3'
  const total = tabla.getRowCount()
  const { pageIndex, pageSize } = tabla.state.pagination
  const desde = pageIndex * pageSize + 1
  const hasta = Math.min((pageIndex + 1) * pageSize, total)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id} className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                {grupo.headers.map((h) => {
                  const derecha = h.column.columnDef.meta?.alinear === 'derecha'
                  const orden = h.column.getIsSorted()
                  return (
                    <th
                      key={h.id}
                      className={`${relleno} font-medium ${derecha ? 'text-right' : ''}`}
                      aria-sort={orden === 'asc' ? 'ascending' : orden === 'desc' ? 'descending' : undefined}
                    >
                      {h.isPlaceholder ? null : h.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-900 ${derecha ? 'flex-row-reverse' : ''}`}
                        >
                          <tabla.FlexRender header={h} />
                          {orden === 'asc' ? (
                            <ArrowUp className="size-3.5" aria-hidden />
                          ) : orden === 'desc' ? (
                            <ArrowDown className="size-3.5" aria-hidden />
                          ) : (
                            <Sort className="size-3.5 opacity-40" aria-hidden />
                          )}
                        </button>
                      ) : (
                        <tabla.FlexRender header={h} />
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tabla.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className={claseFila ? claseFila(fila.original) : 'hover:bg-slate-50'}>
                {fila.getAllCells().map((celda) => {
                  const meta = celda.column.columnDef.meta
                  return (
                    <td key={celda.id} className={`${relleno} ${meta?.alinear === 'derecha' ? 'text-right' : ''} ${meta?.clase ?? ''}`}>
                      <tabla.FlexRender cell={celda} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(nombre || tabla.getPageCount() > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            {tabla.getPageCount() > 1 ? `${desde}–${hasta} de ${total}` : total} {nombre}
          </span>
          {tabla.getPageCount() > 1 && (
            <div className="flex items-center gap-1">
              <span className="mr-2">
                Página {pageIndex + 1} de {tabla.getPageCount()}
              </span>
              <Boton variante="fantasma" aria-label="Página anterior" disabled={!tabla.getCanPreviousPage()} onClick={() => tabla.previousPage()}>
                <ChevronLeft className="size-4" />
              </Boton>
              <Boton variante="fantasma" aria-label="Página siguiente" disabled={!tabla.getCanNextPage()} onClick={() => tabla.nextPage()}>
                <ChevronRight className="size-4" />
              </Boton>
            </div>
          )}
        </div>
      )}
    </>
  )
}
