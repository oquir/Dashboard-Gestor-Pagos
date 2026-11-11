import { Envelope, TickCircle } from 'reicon-react'
import { useState } from 'react'
import {
  saveFile,
  approvalStatusLabel,
  formatDate,
  formatPesos,
  businessDaysBetween,
  awaitsApproval,
  approvalTone,
} from '../../../../lib'
import { useData } from '../../../../store'
import type { NotFiledGround, ApprovalResolution } from '../../../../types'
import { today } from '../../../../utils'
import { Badge, Button, Card, Select, Textarea } from '../../../atoms'
import {
  AttachDocuments,
  Notice,
  Field,
  CardHeader,
  DataItem,
  SentDocuments,
} from '../../../molecules'
import { GROUNDS } from './PriorApproval.constants'
import type { PriorApprovalProps } from './PriorApproval.types'
import { methodsText, whatToDoText } from './PriorApproval.utils'

/**
 * Visto bueno del municipio antes del pago. Solo se rechaza por una causal del art. 580 del Estatuto Tributario, con un
 * comentario y documentos opcionales. Al resolverla, al contribuyente le llega un correo.
 */
export default function PriorApproval({
  d,
  situation,
  email,
  canResolve,
  teller,
}: PriorApprovalProps) {
  const resolveApproval = useData((s) => s.resolveApproval)
  const [ground, setGround] = useState<NotFiledGround | ''>('')
  const [missingGround, setMissingGround] = useState(false)
  const [comment, setComment] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const pending = awaitsApproval(situation)
  const days = businessDaysBetween(today(), situation.limit)
  const discount = d.lines.find((r) => r.code === '36')?.value ?? 0

  const resolve = async (resolution: ApprovalResolution) => {
    setSending(true)
    const documents = await Promise.all(files.map(saveFile))
    resolveApproval(d.id, resolution, comment.trim(), documents)
  }
  const reject = () => (ground ? resolve({ status: 'rejected', ground }) : setMissingGround(true))

  const sent = situation.documents && (
    <SentDocuments
      className="mt-1.5"
      documents={situation.documents}
      title="Respuesta a la aprobación previa"
      context={[`Declaración: ${d.number}`, `Contribuyente: ${d.taxpayer.name}`]}
    />
  )
  const rejectionGround = situation.status === 'rejected' ? situation.ground : undefined

  return (
    <Card>
      <CardHeader
        title="Aprobación previa"
        description="El contribuyente paga cuando el municipio aprueba la declaración."
        actions={
          <Badge tone={approvalTone[situation.status]}>
            {approvalStatusLabel[situation.status]}
          </Badge>
        }
      />
      <div className="space-y-4 p-5">
        <dl className="grid grid-cols-2 gap-4">
          <DataItem label="Radicada">{formatDate(d.filingDate)}</DataItem>
          <DataItem label="Plazo para aprobar">
            {formatDate(situation.limit)}
            {pending && (
              <span
                className={`block text-xs ${days < 0 ? 'font-medium text-red-700' : 'text-slate-500'}`}
              >
                {days > 1
                  ? `Quedan ${days} días hábiles`
                  : days === 1
                    ? 'Queda 1 día hábil'
                    : days === 0
                      ? 'Vence hoy'
                      : 'Vencido'}
              </span>
            )}
          </DataItem>
        </dl>
        <p className="text-xs text-slate-500">
          Descuento, sanciones e intereses se liquidan con la fecha de radicación, aunque la
          aprobación llegue después
          {discount > 0
            ? `: conserva el descuento por pronto pago de ${formatPesos(discount)}.`
            : '.'}
        </p>

        {pending && canResolve && (
          <div className="space-y-3">
            <Field
              label="Causal del rechazo"
              help={
                ground
                  ? `${GROUNDS[ground].description} ${whatToDoText(ground)}`
                  : 'Obligatoria para rechazar: solo por estas causales la declaración se tiene por no presentada (art. 580 del Estatuto Tributario).'
              }
              error={missingGround ? 'Escoge la causal del rechazo.' : undefined}
            >
              <Select
                value={ground}
                onChange={(e) => {
                  setGround(e.target.value as NotFiledGround | '')
                  setMissingGround(false)
                }}
              >
                <option value="">Ninguna</option>
                {(Object.keys(GROUNDS) as NotFiledGround[]).map((value) => (
                  <option key={value} value={value}>
                    {GROUNDS[value].literal}) {GROUNDS[value].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Comentario"
              help="Opcional. Le llega al contribuyente en el correo, con los documentos."
            >
              <Textarea
                rows={3}
                placeholder="Ej.: falta la firma del revisor fiscal; la sociedad está obligada a tenerlo."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Field>
            <AttachDocuments files={files} onChange={setFiles} />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                disabled={sending}
                onClick={() => resolve({ status: 'approved' })}
              >
                <TickCircle className="size-4" aria-hidden /> Aprobar
              </Button>
              <Button variant="danger" disabled={sending} onClick={reject}>
                Rechazar
              </Button>
            </div>
          </div>
        )}
        {pending && !canResolve && (
          <p className="text-sm text-slate-600">La aprobación la da la administración municipal.</p>
        )}

        {situation.receiptUntil && (
          <Notice tone="success" icon={Envelope}>
            <p className="font-medium">Se envió un correo a {email}</p>
            <p className="mt-1">
              {situation.status === 'auto_approved'
                ? `Se aprobó automáticamente al vencer el plazo, el ${formatDate(situation.limit)}.`
                : `Aprobada por ${situation.by} el ${formatDate(situation.date!)}.`}{' '}
              {methodsText(teller)}
              El recibo vale hasta el {formatDate(situation.receiptUntil)}.
            </p>
            {situation.observation && <p className="mt-1">Comentario: {situation.observation}</p>}
            {sent}
          </Notice>
        )}
        {rejectionGround && (
          <Notice tone="danger" icon={Envelope}>
            <p className="font-medium">Se envió un correo a {email}</p>
            <p className="mt-1">
              Rechazada por {situation.by} el {formatDate(situation.date!)}. Causal: literal{' '}
              {GROUNDS[rejectionGround].literal}) del art. 580,{' '}
              {GROUNDS[rejectionGround].label.toLowerCase()}. {GROUNDS[rejectionGround].description}{' '}
              La declaración se tiene por no presentada. {whatToDoText(rejectionGround)}
            </p>
            {situation.observation && <p className="mt-1">Comentario: {situation.observation}</p>}
            {sent}
          </Notice>
        )}
      </div>
    </Card>
  )
}
