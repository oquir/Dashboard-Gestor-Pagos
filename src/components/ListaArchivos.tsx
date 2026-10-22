import { Download, FileArchive, FileText } from 'lucide-react'
import { descargarArchivo, descargarZip, formatoTamano } from '../lib/archivos'
import type { ItemArchivo } from '../lib/archivos'
import { formatoFecha } from '../lib/formato'
import { Boton, CardHeader } from './ui'

interface Props {
  titulo: string
  descripcion?: string
  items: ItemArchivo[]
  /** Líneas que identifican al contribuyente o la declaración en los archivos de muestra. */
  contexto: string[]
  /** Nombre del .zip que reúne todos los archivos cargados. */
  nombreZip: string
  vacio?: string
}

/** Archivos cargados por el contribuyente: descarga uno a uno o todos en un .zip. */
export default function ListaArchivos({ titulo, descripcion, items, contexto, nombreZip, vacio = 'No hay archivos.' }: Props) {
  const cargados = items.flatMap(({ titulo, archivo }) => (archivo ? [{ titulo, archivo }] : []))

  return (
    <>
      <CardHeader
        titulo={titulo}
        descripcion={descripcion}
        acciones={
          cargados.length > 0 && (
            <Boton variante="secundario" onClick={() => descargarZip(nombreZip, cargados, contexto)}>
              <FileArchive className="size-4" aria-hidden /> Descargar todos (.zip)
            </Boton>
          )
        }
      />
      {items.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">{vacio}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map(({ titulo, archivo }) => (
            <li key={titulo} className="flex items-center gap-3 px-5 py-3 text-sm">
              <FileText className={`size-5 shrink-0 ${archivo ? 'text-brand-600' : 'text-slate-300'}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className={archivo ? 'text-slate-900' : 'text-red-700'}>{titulo}</p>
                <p className="truncate text-xs text-slate-500">
                  {archivo ? `${archivo.nombre} · ${formatoTamano(archivo.tamano)} · ${formatoFecha(archivo.fechaCarga)}` : 'No cargado'}
                </p>
              </div>
              {archivo && (
                <button
                  type="button"
                  onClick={() => descargarArchivo(archivo, titulo, contexto)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-brand-700 hover:bg-brand-50"
                  aria-label={`Descargar ${titulo}`}
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
