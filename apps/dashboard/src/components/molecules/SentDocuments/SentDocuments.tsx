import { Download } from 'reicon-react'
import { downloadFile, formatSize } from '../../../lib'
import type { SentDocumentsProps } from './SentDocuments.types'

/** Documentos que la administración le envió al contribuyente, para descargarlos. */
export default function SentDocuments({
  documents,
  title,
  context,
  className = '',
}: SentDocumentsProps) {
  return (
    <ul className={`space-y-1 ${className}`}>
      {documents.map((a, i) => (
        <li key={`${a.name}-${i}`}>
          <button
            type="button"
            onClick={() => downloadFile(a, title, context)}
            className="inline-flex max-w-full items-center gap-1.5 text-left text-brand-fg hover:underline"
          >
            <Download className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{a.name}</span>
            <span className="shrink-0 text-fg-muted">· {formatSize(a.size)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
