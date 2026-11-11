import { TickCircle, CloseCircle } from 'reicon-react'
import { useState } from 'react'
import { saveFile, ritChangeKindLabel, formatDate } from '../../../../lib'
import { useData } from '../../../../store'
import { Button, Card, Textarea } from '../../../atoms'
import { AttachDocuments, Field, CardHeader } from '../../../molecules'
import type { Reply, ApplicationReplyProps } from './ApplicationReply.types'

/** Tarjeta con la que la administración resuelve una solicitud del RIT y le responde al contribuyente. */
export default function ApplicationReply({
  registrationId,
  ritChange,
  email,
}: ApplicationReplyProps) {
  const resolveRitChange = useData((s) => s.resolveRitChange)
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [missingReason, setMissingReason] = useState(false)
  const [sending, setSending] = useState(false)

  const reply = async (status: Reply) => {
    if (status === 'rejected' && !message.trim()) return setMissingReason(true)
    setSending(true)
    const documents = await Promise.all(files.map(saveFile))
    resolveRitChange(registrationId, ritChange.id, status, message.trim(), documents)
  }

  return (
    <Card id={`respuesta-${ritChange.id}`} className="scroll-mt-6">
      <CardHeader
        title="Respuesta al contribuyente"
        description={`${ritChangeKindLabel[ritChange.kind]} radicada el ${formatDate(ritChange.date)}. Se envía a ${email}.`}
      />
      <div className="space-y-4 p-5">
        <Field
          label="Mensaje"
          help="Obligatorio para rechazar."
          error={missingReason ? 'Indica el motivo del rechazo.' : undefined}
        >
          <Textarea
            rows={4}
            placeholder="Ej.: el certificado de existencia se cargó vacío. Adjunte el documento completo en su próxima solicitud."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              setMissingReason(false)
            }}
          />
        </Field>
        <AttachDocuments files={files} onChange={setFiles} />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-3">
        <Button variant="primary" disabled={sending} onClick={() => reply('approved')}>
          <TickCircle className="size-4" aria-hidden /> Aprobar
        </Button>
        <Button variant="secondary" disabled={sending} onClick={() => reply('rejected')}>
          <CloseCircle className="size-4" aria-hidden /> Rechazar
        </Button>
      </div>
    </Card>
  )
}
