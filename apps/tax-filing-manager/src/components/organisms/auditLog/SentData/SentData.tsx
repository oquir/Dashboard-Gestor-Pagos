import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import type { SentDataProps } from './SentData.types'

/** Lo que se envió en la petición, completo y con formato. */
export default function SentData({ r }: SentDataProps) {
  const empty = Object.keys(r.data).length === 0

  return (
    <Card>
      <CardHeader
        title="Datos enviados"
        description="Lo que llegó en el cuerpo o en la URL de la petición. No incluye el valor que había antes."
      />
      <div className="p-5">
        {empty ? (
          <p className="text-sm text-fg-muted">La petición no envió datos.</p>
        ) : (
          <pre className="max-h-[32rem] overflow-auto rounded-md bg-surface-sunken p-4 text-xs leading-relaxed text-fg">
            {JSON.stringify(r.data, null, 2)}
          </pre>
        )}
      </div>
    </Card>
  )
}
