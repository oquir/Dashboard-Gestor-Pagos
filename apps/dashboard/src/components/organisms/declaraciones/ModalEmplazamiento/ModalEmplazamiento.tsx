import { Document, Paperclip, Xmark } from 'reicon-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { FORMATOS_DOCUMENTO, TAMANO_MAXIMO_ARCHIVO } from '../../../../constants'
import { formatoTamano, guardarArchivo } from '../../../../lib/archivos'
import { useDatos } from '../../../../store'
import type { NuevoEmplazamiento } from '../../../../types'
import { hoy } from '../../../../utils'
import { Boton, Input } from '../../../atoms'
import { Campo, Modal, SelectorArchivo } from '../../../molecules'
import type { ModalEmplazamientoProps } from './types'
import { errorFecha, errorNumero } from './utils'

/**
 * Ventana para registrar emplazamientos que el municipio ya notificó: uno, o un lote de omisos con la misma fecha de
 * notificación. Cada uno lleva su número de acto y, si se quiere, la copia del acto.
 */
export default function ModalEmplazamiento({
  tipo,
  destinatarios,
  cerrar,
}: ModalEmplazamientoProps) {
  const registrarEmplazamientos = useDatos((s) => s.registrarEmplazamientos)
  const existentes = useDatos((s) => s.emplazamientos)
  const [fecha, setFecha] = useState(hoy())
  const [numeros, setNumeros] = useState<Record<string, string>>({})
  const [copias, setCopias] = useState<Record<string, File>>({})
  const [muyGrande, setMuyGrande] = useState<string>()
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const fallaFecha = errorFecha(fecha, hoy(), destinatarios, tipo)
  const fallaNumero = (clave: string) => errorNumero(clave, numeros, destinatarios, existentes)
  const varios = destinatarios.length > 1

  const elegirCopia = (clave: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    if (archivo.size > TAMANO_MAXIMO_ARCHIVO) return setMuyGrande(clave)
    setMuyGrande(undefined)
    setCopias((actuales) => ({ ...actuales, [clave]: archivo }))
  }
  const quitarCopia = (clave: string) =>
    setCopias((actuales) =>
      Object.fromEntries(Object.entries(actuales).filter(([k]) => k !== clave)),
    )

  const enviar = async () => {
    setIntentado(true)
    if (fallaFecha || destinatarios.some((x) => fallaNumero(x.clave))) return
    setEnviando(true)
    const nuevos = await Promise.all(
      destinatarios.map(async ({ clave, destino }): Promise<NuevoEmplazamiento> => {
        const copia = copias[clave] ? await guardarArchivo(copias[clave]) : undefined
        return { ...destino, numero: numeros[clave].trim(), fechaNotificacion: fecha, copia }
      }),
    )
    registrarEmplazamientos(nuevos)
    cerrar()
  }

  return (
    <Modal
      titulo={
        tipo === 'declarar'
          ? `Emplazar para declarar${varios ? ` a ${destinatarios.length} omisos` : ''}`
          : 'Registrar emplazamiento para corregir'
      }
      descripcion={
        tipo === 'declarar'
          ? 'Registra el emplazamiento que el municipio ya notificó. Tiene 1 mes para declarar, y desde la notificación la extemporaneidad es la del art. 642: la tasa tras emplazamiento de Configuración, hasta el 200 % del impuesto.'
          : 'Registra el emplazamiento que el municipio ya notificó. Tiene 1 mes para corregir, y desde la notificación toda corrección lleva la sanción del art. 644, numeral 2. No responder no genera sanción.'
      }
      cerrar={cerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={cerrar}>
            Cancelar
          </Boton>
          <Boton variante="primario" disabled={enviando} onClick={enviar}>
            Registrar
          </Boton>
        </>
      }
    >
      <div className="space-y-4">
        <Campo
          etiqueta="Fecha de notificación"
          ayuda={varios ? 'La misma para todos los del lote.' : undefined}
          error={intentado ? fallaFecha : undefined}
        >
          <Input
            type="date"
            data-autofocus
            max={hoy()}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </Campo>

        <ul className="max-h-[50vh] divide-y divide-slate-100 overflow-y-auto rounded-lg ring-1 ring-slate-200">
          {destinatarios.map(({ clave, titulo, descripcion }) => (
            <li key={clave} className="space-y-2 px-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{titulo}</p>
                <p className="truncate text-xs text-slate-500">{descripcion}</p>
              </div>
              <Campo etiqueta="Número del acto" error={intentado ? fallaNumero(clave) : undefined}>
                <Input
                  placeholder={tipo === 'declarar' ? 'Ej.: EPD-2026-014' : 'Ej.: EPC-2026-007'}
                  value={numeros[clave] ?? ''}
                  onChange={(e) =>
                    setNumeros((actuales) => ({ ...actuales, [clave]: e.target.value }))
                  }
                />
              </Campo>
              {copias[clave] ? (
                <p className="flex items-center gap-2 text-sm text-slate-700">
                  <Document className="size-4 shrink-0 text-brand-600" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{copias[clave].name}</span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {formatoTamano(copias[clave].size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => quitarCopia(clave)}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                    aria-label={`Quitar ${copias[clave].name}`}
                  >
                    <Xmark className="size-4" aria-hidden />
                  </button>
                </p>
              ) : (
                <div>
                  <SelectorArchivo
                    texto="Adjuntar copia del acto"
                    icono={Paperclip}
                    accept={FORMATOS_DOCUMENTO}
                    onChange={elegirCopia(clave)}
                  />
                  <p
                    className={`mt-1 text-xs ${muyGrande === clave ? 'text-red-600' : 'text-slate-500'}`}
                  >
                    {muyGrande === clave
                      ? 'Supera los 10 MB y no se adjuntó.'
                      : 'Opcional. PDF, Word, Excel o imagen, hasta 10 MB.'}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
