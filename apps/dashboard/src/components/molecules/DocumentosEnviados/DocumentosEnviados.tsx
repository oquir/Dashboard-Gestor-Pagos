import { Download } from 'reicon-react'
import { descargarArchivo, formatoTamano } from '../../../lib/archivos'
import type { DocumentosEnviadosProps } from './DocumentosEnviados.types'

/** Documentos que la administración le envió al contribuyente, para descargarlos. */
export default function DocumentosEnviados({
  documentos,
  titulo,
  contexto,
  className = '',
}: DocumentosEnviadosProps) {
  return (
    <ul className={`space-y-1 ${className}`}>
      {documentos.map((a, i) => (
        <li key={`${a.nombre}-${i}`}>
          <button
            type="button"
            onClick={() => descargarArchivo(a, titulo, contexto)}
            className="inline-flex max-w-full items-center gap-1.5 text-left text-brand-700 hover:underline"
          >
            <Download className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{a.nombre}</span>
            <span className="shrink-0 text-slate-500">· {formatoTamano(a.tamano)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
