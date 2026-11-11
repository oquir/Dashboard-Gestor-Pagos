import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Tabla from '../../Tabla'
import { COLUMNAS, ORDEN_INICIAL } from './constants'
import type { TablaPagosRecibidosProps } from './types'

/** Pagos recibidos, del más reciente al más antiguo. */
export default function TablaPagosRecibidos({ pagos }: TablaPagosRecibidosProps) {
  return (
    <Card>
      <CardHeader titulo="Pagos recibidos" />
      <Tabla datos={pagos} columnas={COLUMNAS} porPagina={15} ordenInicial={ORDEN_INICIAL} idFila={(f) => f.p.id} nombre="pagos" vacio="No hay pagos registrados" />
    </Card>
  )
}
