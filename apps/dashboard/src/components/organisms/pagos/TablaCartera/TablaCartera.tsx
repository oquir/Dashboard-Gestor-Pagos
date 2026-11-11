import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Tabla from '../../Tabla'
import { COLUMNAS, ORDEN_INICIAL } from './constants'
import type { TablaCarteraProps } from './types'

/** Declaraciones vigentes con saldo por pagar, de la mayor deuda a la menor. */
export default function TablaCartera({ cartera }: TablaCarteraProps) {
  return (
    <Card>
      <CardHeader titulo="Cartera pendiente" descripcion="Declaraciones vigentes con saldo por pagar." />
      <Tabla
        datos={cartera}
        columnas={COLUMNAS}
        porPagina={10}
        ordenInicial={ORDEN_INICIAL}
        idFila={(f) => f.d.id}
        nombre="declaraciones con saldo"
        vacio="No hay cartera pendiente"
      />
    </Card>
  )
}
