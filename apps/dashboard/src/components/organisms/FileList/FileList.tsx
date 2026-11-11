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
        <p className="p-5 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map(({ title, file }) => (
            <li key={title} className="flex items-center gap-3 px-5 py-3 text-sm">
              <Document
                className={`size-5 shrink-0 ${file ? 'text-brand-600' : 'text-slate-300'}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className={file ? 'text-slate-900' : 'text-red-700'}>{title}</p>
                <p className="truncate text-xs text-slate-500">
                  {file
                    ? `${file.name} · ${formatSize(file.size)} · ${formatDate(file.uploadDate)}`
                    : 'No cargado'}
                </p>
              </div>
              {file && (
                <button
                  type="button"
                  onClick={() => downloadFile(file, title, context)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-brand-700 hover:bg-brand-50"
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
