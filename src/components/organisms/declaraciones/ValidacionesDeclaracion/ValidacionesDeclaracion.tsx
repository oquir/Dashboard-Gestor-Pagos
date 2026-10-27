import { AlertTriangle, TickCircle } from 'reicon-react'
import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import type { ValidacionesDeclaracionProps } from './types'
import { validaciones } from './utils'

/** Lo que cumple y las inconsistencias de la declaración. */
export default function ValidacionesDeclaracion({ d, ins, contraRit, municipioConRit }: ValidacionesDeclaracionProps) {
  return (
    <Card>
      <CardHeader
        titulo="Validaciones"
        descripcion={
          contraRit
            ? undefined
            : municipioConRit
              ? 'Este formulario no se valida contra el RIT.'
              : 'El municipio no tiene el RIT en el aplicativo: no hay cruces contra el RIT.'
        }
      />
      <ul className="space-y-2 p-5">
        {validaciones(d, ins, contraRit).map((v) => (
          <li key={v.texto} className="flex items-start gap-2 text-sm">
            {v.ok ? (
              <TickCircle className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="Cumple" />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-label="Inconsistencia" />
            )}
            <span className={v.ok ? 'text-slate-700' : 'font-medium text-red-700'}>{v.texto}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
