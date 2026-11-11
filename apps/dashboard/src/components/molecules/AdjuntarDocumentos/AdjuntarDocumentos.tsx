import { Document, Paperclip, Xmark } from 'reicon-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { FORMATOS_DOCUMENTO, TAMANO_MAXIMO_ARCHIVO } from '../../../constants'
import { formatoTamano } from '../../../lib/archivos'
import SelectorArchivo from '../SelectorArchivo'
import type { AdjuntarDocumentosProps } from './types'

/** Documentos que la administración le envía al contribuyente con su respuesta: los elegidos, para quitarlos, y el botón para agregar. */
export default function AdjuntarDocumentos({ etiqueta = 'Documentos para el contribuyente', archivos, onChange }: AdjuntarDocumentosProps) {
  const [muyGrandes, setMuyGrandes] = useState<string[]>([])

  const agregar = (e: ChangeEvent<HTMLInputElement>) => {
    const elegidos = Array.from(e.target.files ?? [])
    e.target.value = ''
    setMuyGrandes(elegidos.filter((f) => f.size > TAMANO_MAXIMO_ARCHIVO).map((f) => f.name))
    onChange([...archivos, ...elegidos.filter((f) => f.size <= TAMANO_MAXIMO_ARCHIVO)])
  }

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700">{etiqueta}</p>
      {archivos.length > 0 && (
        <ul className="mb-2 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
          {archivos.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700">
              <Document className="size-4 shrink-0 text-brand-600" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="shrink-0 text-xs text-slate-500">{formatoTamano(f.size)}</span>
              <button
                type="button"
                onClick={() => onChange(archivos.filter((_, j) => j !== i))}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                aria-label={`Quitar ${f.name}`}
              >
                <Xmark className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <SelectorArchivo texto="Adjuntar documentos" icono={Paperclip} multiple accept={FORMATOS_DOCUMENTO} onChange={agregar} />
      {muyGrandes.length > 0 ? (
        <p className="mt-1 text-xs text-red-600">Supera los 10 MB y no se adjuntó: {muyGrandes.join(', ')}.</p>
      ) : (
        <p className="mt-1 text-xs text-slate-500">Opcionales. PDF, Word, Excel o imagen, hasta 10 MB cada uno.</p>
      )}
    </div>
  )
}
