import { DocumentUpload } from 'reicon-react'
import type { SelectorArchivoProps } from './types'

/** Botón punteado que abre el selector de archivos del sistema. */
export default function SelectorArchivo({ texto, icono: Icono = DocumentUpload, ...props }: SelectorArchivoProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus-within:ring-2 focus-within:ring-brand-500 hover:border-brand-500 hover:text-brand-700">
      <Icono className="size-4" aria-hidden /> {texto}
      <input type="file" className="sr-only" {...props} />
    </label>
  )
}
