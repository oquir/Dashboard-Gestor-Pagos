import { SentDocuments } from '../../../molecules'
import type { SentReplyProps } from './SentReply.types'

/** Observación y documentos que la administración le envió al contribuyente al resolver la solicitud. */
export default function SentReply({ ritChange, registration }: SentReplyProps) {
  if (!ritChange.observation && !ritChange.replyDocuments) return null

  return (
    <div className="mt-2 rounded-md bg-surface-sunken px-3 py-2 text-xs">
      <p className="font-medium text-fg-soft">Respuesta enviada al contribuyente</p>
      {ritChange.observation && <p className="mt-1 text-fg">{ritChange.observation}</p>}
      {ritChange.replyDocuments && (
        <SentDocuments
          className="mt-1.5"
          documents={ritChange.replyDocuments}
          title="Respuesta a la solicitud"
          context={[`Contribuyente: ${registration.name}`, `RIT: ${registration.ritNumber}`]}
        />
      )}
    </div>
  )
}
