import { Download } from 'reicon-react'
import { descargarDeclaracion } from '../../../../lib'
import { RENGLONES_TOTALES } from '../../../../lib'
import { useDatos } from '../../../../store'
import { Boton, Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Tabla from '../../Tabla'
import { COLUMNAS_RENGLONES } from './Liquidacion.constants'
import type { LiquidacionProps } from './Liquidacion.types'

/** Renglones de la declaración, con subtotales y totales resaltados, y su descarga en PDF. */
export default function Liquidacion({ d }: LiquidacionProps) {
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
      <Tabla
        datos={d.renglones}
        columnas={COLUMNAS_RENGLONES}
        densa
        claseFila={(r) => (RENGLONES_TOTALES.has(r.codigo) ? 'bg-slate-50 font-semibold' : '')}
      />
    </Card>
  )
}
