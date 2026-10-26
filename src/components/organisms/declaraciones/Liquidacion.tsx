import { Download } from 'reicon-react'
import { formatoPesos } from '../../../lib/formato'
import { descargarDeclaracion } from '../../../lib/pdfDeclaracion'
import { RENGLONES_TOTALES } from '../../../lib/reglas'
import { ayudanteColumnas } from '../../../lib/tabla'
import { useDatos } from '../../../store'
import type { Declaracion, Renglon } from '../../../types'
import { Boton, Card } from '../../atoms'
import { CardHeader } from '../../molecules'
import Tabla from '../Tabla'

const col = ayudanteColumnas<Renglon>()

// Sin ordenamiento: la liquidación se lee en el orden del formulario.
const COLUMNAS_RENGLONES = col.columns([
  col.accessor('codigo', { header: 'Renglón', enableSorting: false, meta: { clase: 'w-20 tabular-nums text-slate-500' } }),
  col.accessor('concepto', { header: 'Concepto', enableSorting: false, meta: { clase: 'text-slate-700' } }),
  col.accessor('valor', {
    header: 'Valor',
    enableSorting: false,
    meta: { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' },
    cell: ({ getValue }) => formatoPesos(getValue()),
  }),
])

/** Renglones de la declaración, con subtotales y totales resaltados, y su descarga en PDF. */
export default function Liquidacion({ d }: { d: Declaracion }) {
  return (
    <Card>
      <CardHeader
        titulo="Liquidación"
        descripcion="Valores redondeados al múltiplo de mil más cercano."
        acciones={
          <Boton variante="secundario" onClick={() => descargarDeclaracion(d, useDatos.getState())}>
            <Download className="size-4" aria-hidden /> Descargar PDF
          </Boton>
        }
      />
      <Tabla datos={d.renglones} columnas={COLUMNAS_RENGLONES} densa claseFila={(r) => (RENGLONES_TOTALES.has(r.codigo) ? 'bg-slate-50 font-semibold' : '')} />
    </Card>
  )
}
