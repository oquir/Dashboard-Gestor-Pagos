import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Tabla from '../../Tabla'
import { COLUMNAS, ORDEN_INICIAL } from './RetencionesSinConsignar.constants'
import type { RetencionesSinConsignarProps } from './RetencionesSinConsignar.types'

/** ReteICA y AutoReteICA con saldo y el plazo que les queda para consignarlo (art. 402 del Código Penal). */
export default function RetencionesSinConsignar({ filas }: RetencionesSinConsignarProps) {
  return (
    <Card>
      <CardHeader
        titulo="Retenciones sin consignar"
        descripcion="ReteICA y AutoReteICA que no se han pagado completas. El agente tiene 2 meses desde el vencimiento para consignar lo retenido; después, puede ser delito (art. 402 del Código Penal). Si paga todo con intereses, se puede cerrar el proceso penal."
      />
      <Tabla
        datos={filas}
        columnas={COLUMNAS}
        porPagina={10}
        ordenInicial={ORDEN_INICIAL}
        idFila={(f) => f.d.id}
        nombre="retenciones sin consignar"
        vacio="Todo lo retenido está consignado"
      />
    </Card>
  )
}
