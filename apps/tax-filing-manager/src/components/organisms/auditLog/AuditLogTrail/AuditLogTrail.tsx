import { ChevronLeft, ChevronRight } from 'reicon-react'
import { useNavigate } from 'react-router'
import { Button } from '../../../atoms'
import type { AuditLogTrailProps } from './AuditLogTrail.types'

/** Ir al registro anterior o al siguiente por número, dentro de lo que se recorre: un municipio o todos. */
export default function AuditLogTrail({ previous, nextOne, scope }: AuditLogTrailProps) {
  const goTo = useNavigate()

  return (
    <nav
      aria-label="Registros vecinos"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <Button disabled={!previous} onClick={() => previous && goTo(`/bitacora/${previous.id}`)}>
        <ChevronLeft className="size-4" aria-hidden />{' '}
        {previous ? `Anterior: N.º ${previous.id}` : 'No hay anteriores'}
      </Button>
      <p className="text-sm text-fg-muted">Recorres los registros de {scope}</p>
      <Button disabled={!nextOne} onClick={() => nextOne && goTo(`/bitacora/${nextOne.id}`)}>
        {nextOne ? `Siguiente: N.º ${nextOne.id}` : 'No hay siguientes'}{' '}
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </nav>
  )
}
