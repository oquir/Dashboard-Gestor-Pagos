import { Location } from 'reicon-react'
import { useNavigate } from 'react-router'
import { compactFormat } from '../../../../lib'
import { useData } from '../../../../store'
import { Badge, Button, Card } from '../../../atoms'
import { Figure } from '../../../molecules'
import type { MunicipalityHeaderProps } from './MunicipalityHeader.types'

/** El municipio elegido: dónde está, su estado, sus cifras y el acceso a su tablero. */
export default function MunicipalityHeader({
  municipality: m,
  figures: c,
}: MunicipalityHeaderProps) {
  const toggleMunicipality = useData((s) => s.toggleMunicipality)
  const navigate = useNavigate()

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{m.name}</h2>
            <Badge tone={m.isActive ? 'success' : 'neutral'}>
              {m.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <Location className="size-3.5" aria-hidden /> {m.department} · DANE {m.daneCode}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Ver tablero
          </Button>
          <Button variant="ghost" onClick={() => toggleMunicipality(m.id)}>
            {m.isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      </div>
      {!m.isActive && (
        <p className="mt-3 text-sm text-slate-500">
          Mientras esté inactivo, sus usuarios no pueden entrar al aplicativo.
        </p>
      )}
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
        <Figure label="Inscripciones activas">
          {m.rit ? (
            c.activeItems
          ) : (
            <span className="text-sm font-normal text-slate-500">Sin RIT</span>
          )}
        </Figure>
        <Figure label="Declaraciones">{c.declarations}</Figure>
        <Figure label="Recaudo 2026">${compactFormat(c.collection)}</Figure>
        <Figure label="Usuarios activos">{c.users}</Figure>
      </dl>
    </Card>
  )
}
