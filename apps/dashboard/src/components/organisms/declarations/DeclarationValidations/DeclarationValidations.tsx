import { AlertTriangle, TickCircle } from 'reicon-react'
import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import type { DeclarationValidationsProps } from './DeclarationValidations.types'
import { validations } from './DeclarationValidations.utils'

/** Lo que cumple y las inconsistencias de la declaración. */
export default function DeclarationValidations({
  d,
  reg,
  againstRit,
  municipalityWithRit,
  corrected,
  penalty,
}: DeclarationValidationsProps) {
  return (
    <Card>
      <CardHeader
        title="Validaciones"
        description={
          againstRit
            ? undefined
            : municipalityWithRit
              ? 'Este formulario no se valida contra el RIT.'
              : 'El municipio no tiene el RIT en el aplicativo: no hay cruces contra el RIT.'
        }
      />
      <ul className="space-y-2 p-5">
        {validations(d, reg, againstRit, corrected, penalty).map((v) => (
          <li key={v.text} className="flex items-start gap-2 text-sm">
            {v.ok ? (
              <TickCircle className="mt-0.5 size-4 shrink-0 text-secondary" aria-label="Cumple" />
            ) : (
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0 text-danger"
                aria-label="Inconsistencia"
              />
            )}
            <span className={v.ok ? 'text-fg' : 'font-medium text-danger-fg'}>{v.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
