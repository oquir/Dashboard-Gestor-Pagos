import { Document, Paperclip, Xmark } from 'reicon-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { DOCUMENT_FORMATS, MAX_FILE_SIZE } from '../../../constants'
import { formatSize } from '../../../lib'
import FilePicker from '../FilePicker'
import type { AttachDocumentsProps } from './AttachDocuments.types'

/** Documentos que la administración le envía al contribuyente con su respuesta: los elegidos, para quitarlos, y el botón para agregar. */
export default function AttachDocuments({
  label = 'Documentos para el contribuyente',
  files,
  onChange,
}: AttachDocumentsProps) {
  const [tooLargeOnes, setTooLargeOnes] = useState<string[]>([])

  const add = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedOnes = Array.from(e.target.files ?? [])
    e.target.value = ''
    setTooLargeOnes(selectedOnes.filter((f) => f.size > MAX_FILE_SIZE).map((f) => f.name))
    onChange([...files, ...selectedOnes.filter((f) => f.size <= MAX_FILE_SIZE)])
  }

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-fg">{label}</p>
      {files.length > 0 && (
        <ul className="mb-2 divide-y divide-border-subtle rounded-lg ring-1 ring-border">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-fg"
            >
              <Document className="size-4 shrink-0 text-brand-fg" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="shrink-0 text-xs text-fg-muted">{formatSize(f.size)}</span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="rounded p-0.5 text-fg-subtle hover:bg-surface-raised hover:text-danger"
                aria-label={`Quitar ${f.name}`}
              >
                <Xmark className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <FilePicker
        text="Adjuntar documentos"
        icon={Paperclip}
        multiple
        accept={DOCUMENT_FORMATS}
        onChange={add}
      />
      {tooLargeOnes.length > 0 ? (
        <p className="mt-1 text-xs text-danger">
          Supera los 10 MB y no se adjuntó: {tooLargeOnes.join(', ')}.
        </p>
      ) : (
        <p className="mt-1 text-xs text-fg-muted">
          Opcionales. PDF, Word, Excel o imagen, hasta 10 MB cada uno.
        </p>
      )}
    </div>
  )
}
