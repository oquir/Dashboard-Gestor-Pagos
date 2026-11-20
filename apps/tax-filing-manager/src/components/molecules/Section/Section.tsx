import { Card } from '../../atoms'
import CardHeader from '../CardHeader'
import type { SectionProps } from './Section.types'

/** Tarjeta de formulario: título y campos en dos columnas. */
export default function Section({ title, description, actions, children }: SectionProps) {
  return (
    <Card>
      <CardHeader title={title} description={description} actions={actions} />
      <div className="grid gap-5 p-5 sm:grid-cols-2">{children}</div>
    </Card>
  )
}
