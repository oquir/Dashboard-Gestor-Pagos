import { Download, Zip, Document } from 'reicon-react'
import { downloadFile, downloadZip, formatSize, formatDate } from '../../../lib'
import { Button } from '../../atoms'
import { CardHeader } from '../../molecules'
import type { FileListProps } from './FileList.types'

/** Archivos cargados por el contribuyente: descarga uno a uno o todos en un .zip. */
export default function FileList({
  title,
  description,
  items,
  context,
  zipName,
  empty = 'No hay archivos.',
}: FileListProps) {
  const uploadedOnes = items.flatMap(({ title, file }) => (file ? [{ title, file }] : []))

  return (
    <>
      <CardHeader
        title={title}
        description={description}
        actions={
          uploadedOnes.length > 0 && (
            <Button variant="secondary" onClick={() => downloadZip(zipName, uploadedOnes, context)}>
              <Zip className="size-4" aria-hidden /> Descargar todos (.zip)
            </Button>
          )
        }
      />
      {items.length === 0 ? (
        <p className="p-5 text-sm text-fg-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {items.map(({ title, file }) => (
            <li key={title} className="flex items-center gap-3 px-5 py-3 text-sm">
              <Document
                className={`size-5 shrink-0 ${file ? 'text-brand-fg' : 'text-fg-subtle'}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className={file ? 'text-fg-strong' : 'text-danger-fg'}>{title}</p>
                <p className="truncate text-xs text-fg-muted">
                  {file
                    ? `${file.name} · ${formatSize(file.size)} · ${formatDate(file.uploadDate)}`
                    : 'No cargado'}
                </p>
              </div>
              {file && (
                <button
                  type="button"
                  onClick={() => downloadFile(file, title, context)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-brand-fg hover:bg-brand-surface"
                  aria-label={`Descargar ${title}`}
                >
                  <Download className="size-4" aria-hidden /> Descargar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
