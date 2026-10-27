import { ayudanteColumnas } from '../../../../lib/tabla'
import type { FilaDeclaracion } from '../../../../types'
import { Casilla } from '../../../atoms'
import type { Marcar } from './types'

export const col = ayudanteColumnas<FilaDeclaracion>()

/** Casillas para elegir declaraciones; la del encabezado marca todas las filtradas, no solo la página. */
export function columnaSeleccion(filas: FilaDeclaracion[], seleccion: ReadonlySet<string>, marcar: Marcar) {
  const marcadas = filas.filter((f) => seleccion.has(f.d.id)).length
  return col.display({
    id: 'seleccion',
    header: () => (
      <Casilla
        aria-label="Seleccionar todas las declaraciones filtradas"
        title={`Seleccionar las ${filas.length} declaraciones filtradas`}
        checked={filas.length > 0 && marcadas === filas.length}
        ref={(el) => {
          if (el) el.indeterminate = marcadas > 0 && marcadas < filas.length
        }}
        onChange={(e) => marcar(filas.map((f) => f.d.id), e.target.checked)}
      />
    ),
    meta: { clase: 'w-10' },
    cell: ({ row: { original: { d } } }) => (
      <Casilla aria-label={`Seleccionar la declaración ${d.numero}`} checked={seleccion.has(d.id)} onChange={(e) => marcar([d.id], e.target.checked)} />
    ),
  })
}
