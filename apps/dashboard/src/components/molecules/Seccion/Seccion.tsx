import { Card } from '../../atoms'
import CardHeader from '../CardHeader'
import type { SeccionProps } from './types'

/** Tarjeta de formulario: título y campos en dos columnas. */
export default function Seccion({ titulo, descripcion, children }: SeccionProps) {
  return (
    <Card>
      <CardHeader titulo={titulo} descripcion={descripcion} />
      <div className="grid gap-5 p-5 sm:grid-cols-2">{children}</div>
    </Card>
  )
}
