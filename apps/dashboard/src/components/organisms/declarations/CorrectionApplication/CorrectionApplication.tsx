import { Envelope, TickCircle } from 'reicon-react'
import { useState } from 'react'
import {
  correctionStatusLabel,
  formatDate,
  formatPesos,
  correctionToResolve,
  lowestValue,
  roundToThousand,
  CORRECTION_REJECTION_PENALTY,
  correctionTone,
} from '../../../../lib'
import { useData } from '../../../../store'
import { dayDifference, today } from '../../../../utils'
import { Badge, Button, Card, Textarea } from '../../../atoms'
import { Notice, Field, CardHeader, DataItem } from '../../../molecules'
import type { CorrectionApplicationProps } from './CorrectionApplication.types'

/**
 * Solicitud de corrección a la baja con el trámite del art. 589 anterior: el municipio la acepta o la rechaza dentro de
 * los 6 meses siguientes a la radicación; si no responde, se acepta sola. Al resolverla, al contribuyente le llega un correo.
 */
export default function CorrectionApplication({
  d,
  corrected,
  situation,
  email,
  canResolve,
}: CorrectionApplicationProps) {
  const resolveCorrection = useData((s) => s.resolveCorrection)
  const [observation, setObservation] = useState('')
  const toResolve = correctionToResolve(situation)
  const days = dayDifference(today(), situation.limit)
  const smaller = corrected ? lowestValue(d, corrected) : 0
  const penalty = roundToThousand(smaller * CORRECTION_REJECTION_PENALTY)
  const previous = corrected ? `la declaración ${corrected.number}` : 'la declaración que corrige'

  return (
    <Card>
      <CardHeader
        title="Solicitud de corrección a la baja"
        description="El municipio tiene 6 meses para aceptarla o rechazarla; si no responde, se acepta sola (art. 589 del Estatuto Tributario, texto anterior a la Ley 1819 de 2016)."
        actions={
          <Badge tone={correctionTone[situation.status]}>
            {correctionStatusLabel[situation.status]}
          </Badge>
        }
      />
      <div className="space-y-4 p-5">
        <dl className="grid grid-cols-2 gap-4">
          <DataItem label="Radicada">{formatDate(d.filingDate)}</DataItem>
          <DataItem label="Plazo para resolver">
            {formatDate(situation.limit)}
            {toResolve && (
              <span
                className={`block text-xs ${days <= 15 ? 'font-medium text-amber-700' : 'text-slate-500'}`}
              >
                {days > 1 ? `Quedan ${days} días` : days === 1 ? 'Queda 1 día' : 'Vence hoy'}
              </span>
            )}
          </DataItem>
        </dl>
        <dl className="space-y-4">
          <DataItem label="Menor valor que pide">{formatPesos(smaller)}</DataItem>
          <DataItem label="Motivo del contribuyente">{situation.reason}</DataItem>
        </dl>

        {toResolve && canResolve && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Si se acepta, reemplaza a {previous}. Si se rechaza, esa sigue vigente y el rechazo
              lleva una sanción del 20 % del menor valor que pide ({formatPesos(penalty)}), que
              impone la administración en el mismo acto, después de un proceso previo (Corte
              Constitucional, C-005 de 1998). El dashboard no la liquida.
            </p>
            <Field
              label="Observación"
              help="Obligatoria para rechazar. Le llega al contribuyente en el correo."
            >
              <Textarea
                rows={3}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                onClick={() => resolveCorrection(d.id, 'accepted', observation.trim())}
              >
                <TickCircle className="size-4" aria-hidden /> Aceptar
              </Button>
              <Button
                variant="danger"
                disabled={!observation.trim()}
                onClick={() => resolveCorrection(d.id, 'rejected', observation.trim())}
              >
                Rechazar
              </Button>
            </div>
          </div>
        )}
        {toResolve && !canResolve && (
          <p className="text-sm text-slate-600">La resuelve la administración municipal.</p>
        )}

        {situation.status === 'accepted' && (
          <Notice tone="success" icon={Envelope}>
            <p className="font-medium">Se envió un correo a {email}</p>
            <p className="mt-1">
              Aceptada por {situation.by} el {formatDate(situation.date!)}: reemplaza a {previous}.
            </p>
            {situation.observation && <p className="mt-1">Observación: {situation.observation}</p>}
          </Notice>
        )}
        {situation.status === 'accepted_by_silence' && (
          <Notice tone="info">
            Se aceptó sola el {formatDate(situation.limit)}: el municipio no la resolvió en los 6
            meses (silencio positivo). Reemplaza a {previous}.
          </Notice>
        )}
        {situation.status === 'rejected' && (
          <Notice tone="danger" icon={Envelope}>
            <p className="font-medium">Se envió un correo a {email}</p>
            <p className="mt-1">
              Rechazada por {situation.by} el {formatDate(situation.date!)}: {situation.observation}
              . Sigue vigente {previous}.
            </p>
            <p className="mt-1">
              El rechazo lleva una sanción del 20 % del menor valor que pidió (
              {formatPesos(penalty)}), que impone la administración en el mismo acto. El dashboard
              no la liquida.
            </p>
          </Notice>
        )}
      </div>
    </Card>
  )
}
