import { formatoFecha, formatoPesos } from '../../../../lib/formato'
import type { Columna, Fila } from '../../../../lib/reportes'
import { ayudanteColumnas } from '../../../../lib/tabla'

const col = ayudanteColumnas<Fila>()

export const columnasTabla = (columnas: Columna[]) =>
  col.columns(
    columnas.map((c, i) =>
      col.accessor((f) => f[i], {
        id: String(i),
        header: c.titulo,
        meta:
          c.formato === 'pesos'
            ? { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' }
            : { clase: 'whitespace-nowrap text-slate-700' },
        cell: ({ getValue }) => {
          const valor = getValue()
          if (c.formato === 'pesos') return formatoPesos(Number(valor))
          return c.formato === 'fecha' && valor ? formatoFecha(String(valor)) : valor
        },
      }),
    ),
  )
