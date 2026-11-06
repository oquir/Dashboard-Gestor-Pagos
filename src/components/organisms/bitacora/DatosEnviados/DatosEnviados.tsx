import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import type { DatosEnviadosProps } from './types'

/** Lo que se envió en la petición, completo y con formato. */
export default function DatosEnviados({ r }: DatosEnviadosProps) {
  const vacio = Object.keys(r.datos).length === 0

  return (
    <Card>
      <CardHeader titulo="Datos enviados" descripcion="Lo que llegó en el cuerpo o en la URL de la petición. No incluye el valor que había antes." />
      <div className="p-5">
        {vacio ? (
          <p className="text-sm text-slate-500">La petición no envió datos.</p>
        ) : (
          <pre className="max-h-[32rem] overflow-auto rounded-md bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">{JSON.stringify(r.datos, null, 2)}</pre>
        )}
      </div>
    </Card>
  )
}
