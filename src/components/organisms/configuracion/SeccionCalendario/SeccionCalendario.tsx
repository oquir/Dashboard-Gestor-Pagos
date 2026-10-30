import { Calendar, CloudDownload, CloudUpload, Plus, Xmark } from 'reicon-react'
import { useRef, useState } from 'react'
import { ANIO_EN_CURSO } from '../../../../constants'
import { copiarCalendarioVigencia, generarCalendarioSugerido } from '../../../../lib/configuracion'
import type { CalendarioVigencia } from '../../../../types'
import { Boton, Input, Select } from '../../../atoms'
import { Campo, Interruptor, Seccion } from '../../../molecules'
import { NOMBRES_BIMESTRES, NOMBRES_MESES } from './constants'
import type { SeccionCalendarioProps } from './types'

export default function SeccionCalendario({ b, cambiar, editable, errores }: SeccionCalendarioProps) {
  const periodicidad = b.periodicidadRetencion ?? 'bimestral'
  const listaVigencias = b.calendarioTributario?.porVigencia ?? []
  const vigencias = listaVigencias.map((v) => v.vigencia).sort((x, y) => y - x)

  const [elegida, setElegida] = useState<number>()
  const [mensajeArchivo, setMensajeArchivo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const vigencia =
    elegida !== undefined && vigencias.includes(elegida)
      ? elegida
      : vigencias.includes(ANIO_EN_CURSO)
        ? ANIO_EN_CURSO
        : vigencias[0]

  const cal = listaVigencias.find((v) => v.vigencia === vigencia)
  const tieneAutoIndependiente = Boolean(cal?.vencimientosAutorretencion && cal.vencimientosAutorretencion.length > 0)

  const actualizarCalendarios = (nuevos: CalendarioVigencia[]) => {
    cambiar({
      calendarioTributario: {
        porVigencia: nuevos,
      },
    })
  }

  const cambiarCal = (parcial: Partial<CalendarioVigencia>) => {
    if (!cal) return
    const actualizados = listaVigencias.map((v) => (v.vigencia === vigencia ? { ...v, ...parcial } : v))
    actualizarCalendarios(actualizados)
  }

  const agregarVigencia = () => {
    const ultima = vigencias[0]
    const nueva = ultima === undefined ? ANIO_EN_CURSO : ultima + 1
    const base = listaVigencias.find((v) => v.vigencia === ultima)
    const nuevoCal = base
      ? copiarCalendarioVigencia(base, nueva)
      : generarCalendarioSugerido(nueva, periodicidad)

    actualizarCalendarios([...listaVigencias, nuevoCal])
    setElegida(nueva)
    setMensajeArchivo(null)
  }

  const quitarVigencia = () => {
    if (vigencia === undefined) return
    actualizarCalendarios(listaVigencias.filter((v) => v.vigencia !== vigencia))
    setElegida(undefined)
    setMensajeArchivo(null)
  }

  const aplicarSugeridas = () => {
    if (vigencia === undefined) return
    const sugerido = generarCalendarioSugerido(vigencia, periodicidad)
    cambiarCal({
      decreto: sugerido.decreto,
      vencimientoIca: sugerido.vencimientoIca,
      vencimientosReteica: sugerido.vencimientosReteica,
      vencimientosAutorretencion: tieneAutoIndependiente ? sugerido.vencimientosReteica : undefined,
    })
    setMensajeArchivo(`Fechas sugeridas generadas para el año gravable ${vigencia}.`)
  }

  const anteriorVigencia = vigencias.filter((v) => v < (vigencia ?? 0))[0]
  const copiarAnterior = () => {
    if (vigencia === undefined || !anteriorVigencia) return
    const base = listaVigencias.find((v) => v.vigencia === anteriorVigencia)
    if (!base) return
    const copia = copiarCalendarioVigencia(base, vigencia)
    cambiarCal({
      decreto: copia.decreto,
      vencimientoIca: copia.vencimientoIca,
      vencimientosReteica: copia.vencimientosReteica,
      vencimientosAutorretencion: copia.vencimientosAutorretencion,
    })
    setMensajeArchivo(`Datos copiados del año gravable ${anteriorVigencia} e incrementados en un año.`)
  }

  const exportarCalendario = () => {
    if (!cal) return
    const blob = new Blob([JSON.stringify(cal, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calendario_tributario_${vigencia}_${b.municipioId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cargarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const contenido = JSON.parse(event.target?.result as string) as CalendarioVigencia
        if (!contenido || typeof contenido !== 'object') {
          throw new Error('Estructura de archivo inválida.')
        }
        if (!contenido.vigencia || !contenido.vencimientoIca) {
          throw new Error('El archivo debe incluir "vigencia" y "vencimientoIca".')
        }

        const existe = listaVigencias.some((v) => v.vigencia === contenido.vigencia)
        const nuevaLista = existe
          ? listaVigencias.map((v) => (v.vigencia === contenido.vigencia ? contenido : v))
          : [...listaVigencias, contenido]

        actualizarCalendarios(nuevaLista)
        setElegida(contenido.vigencia)
        setMensajeArchivo(`Calendario del año gravable ${contenido.vigencia} cargado exitosamente desde "${file.name}".`)
      } catch (err) {
        setMensajeArchivo(`Error al leer el archivo: ${err instanceof Error ? err.message : 'formato no reconocido'}`)
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  const cambiarFechaReteica = (periodo: number, fecha: string) => {
    if (!cal) return
    const actuales = [...(cal.vencimientosReteica ?? [])]
    const idx = actuales.findIndex((p) => p.periodo === periodo)
    if (idx >= 0) {
      actuales[idx] = { periodo, fecha }
    } else {
      actuales.push({ periodo, fecha })
    }
    cambiarCal({ vencimientosReteica: actuales })
  }

  const cambiarFechaAutorretencion = (periodo: number, fecha: string) => {
    if (!cal) return
    const actuales = [...(cal.vencimientosAutorretencion ?? [])]
    const idx = actuales.findIndex((p) => p.periodo === periodo)
    if (idx >= 0) {
      actuales[idx] = { periodo, fecha }
    } else {
      actuales.push({ periodo, fecha })
    }
    cambiarCal({ vencimientosAutorretencion: actuales })
  }

  const alternarAutoIndependiente = (independiente: boolean) => {
    if (!cal) return
    if (independiente) {
      cambiarCal({ vencimientosAutorretencion: [...(cal.vencimientosReteica ?? [])] })
    } else {
      cambiarCal({ vencimientosAutorretencion: undefined })
    }
  }

  const periodosEsperados = periodicidad === 'bimestral' ? 6 : 12
  const nombresPeriodos = periodicidad === 'bimestral' ? NOMBRES_BIMESTRES : NOMBRES_MESES

  const reteicaMap = new Map((cal?.vencimientosReteica ?? []).map((p) => [p.periodo, p.fecha]))
  const autoMap = new Map((cal?.vencimientosAutorretencion ?? []).map((p) => [p.periodo, p.fecha]))

  const tieneError = (v: number) => Object.keys(errores).some((k) => k.startsWith(`calendario-${v}`))

  return (
    <Seccion
      titulo="Calendario tributario"
      descripcion="Fechas de vencimiento para la presentación y pago de ICA anual, retenciones y autorretenciones por año gravable."
    >
      <div className="space-y-4 sm:col-span-2">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-end gap-3">
            {vigencia !== undefined && (
              <Campo etiqueta="Año gravable">
                <Select value={vigencia} onChange={(e) => { setElegida(Number(e.target.value)); setMensajeArchivo(null) }}>
                  {vigencias.map((v) => (
                    <option key={v} value={v}>
                      Año gravable {v}
                      {tieneError(v) ? ' (revisar)' : ''}
                    </option>
                  ))}
                </Select>
              </Campo>
            )}
            {editable && (
              <Boton onClick={agregarVigencia}>
                <Plus className="size-4" aria-hidden /> Agregar año gravable
              </Boton>
            )}
            {editable && vigencia !== undefined && (
              <Boton variante="fantasma" onClick={quitarVigencia}>
                <Xmark className="size-4" aria-hidden /> Quitar {vigencia}
              </Boton>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={cargarArchivo} />
            {editable && (
              <Boton
                variante="secundario"
                onClick={() => fileInputRef.current?.click()}
                title="Cargar fechas desde archivo JSON"
              >
                <CloudUpload className="size-4" aria-hidden /> Cargar archivo JSON
              </Boton>
            )}
            {cal && (
              <Boton variante="secundario" onClick={exportarCalendario} title="Descargar plantilla o copia de respaldo">
                <CloudDownload className="size-4" aria-hidden /> Exportar JSON
              </Boton>
            )}
          </div>
        </div>

        {mensajeArchivo && (
          <div
            className={`flex items-center justify-between rounded-md p-3 text-sm ${
              mensajeArchivo.startsWith('Error')
                ? 'border border-red-200 bg-red-50 text-red-700'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            <span>{mensajeArchivo}</span>
            <button
              type="button"
              className="text-xs font-semibold underline hover:opacity-80"
              onClick={() => setMensajeArchivo(null)}
            >
              Cerrar
            </button>
          </div>
        )}

        {vigencia === undefined || !cal ? (
          <p className="text-sm text-slate-500">Aún no se ha registrado ningún año gravable en el calendario tributario.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <span>
                Configuración del año gravable <strong>{vigencia}</strong> (declaraciones de retención durante el año y declaración de ICA anual en {vigencia + 1}).
              </span>
              {editable && (
                <div className="flex flex-wrap items-center gap-2">
                  <Boton variante="secundario" onClick={aplicarSugeridas}>
                    <Calendar className="size-3.5" aria-hidden /> Generar sugeridas
                  </Boton>
                  {anteriorVigencia && (
                    <Boton variante="secundario" onClick={copiarAnterior}>
                      Copiar de {anteriorVigencia} (+1 año)
                    </Boton>
                  )}
                </div>
              )}
            </div>

            <Campo
              etiqueta="Acto administrativo o decreto que fija el calendario"
              ayuda="Número y año del decreto o resolución municipal de respaldo."
            >
              <Input
                value={cal.decreto ?? ''}
                disabled={!editable}
                onChange={(e) => cambiarCal({ decreto: e.target.value })}
                placeholder="Ej: Decreto 089 de 2026"
              />
            </Campo>

            {/* ICA Anual */}
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">ICA Anual (Formulario Único Nacional)</h4>
                <p className="text-xs text-slate-500">
                  Fecha límite general para presentar y pagar la declaración anual del año gravable {vigencia}. Vence en {vigencia + 1}.
                </p>
              </div>

              <div className="max-w-xs">
                <Campo
                  etiqueta="Fecha límite de vencimiento"
                  error={errores[`calendario-${vigencia}-ica`]}
                >
                  <Input
                    type="date"
                    disabled={!editable}
                    value={cal.vencimientoIca}
                    onChange={(e) => cambiarCal({ vencimientoIca: e.target.value })}
                  />
                </Campo>
              </div>
            </div>

            {/* ReteICA y AutoReteICA */}
            <div className="rounded-lg border border-slate-200 p-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Retención en la fuente (ReteICA) y Autorretención (AutoReteICA)
                </h4>
                <p className="text-xs text-slate-500">
                  Periodicidad actual del municipio: <strong className="capitalize">{periodicidad}</strong> ({periodosEsperados} periodos al año).
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: periodosEsperados }).map((_, i) => {
                  const numPeriodo = i + 1
                  const nombre = nombresPeriodos[i] ?? `Periodo ${numPeriodo}`
                  const fechaActual = reteicaMap.get(numPeriodo) ?? ''
                  const err = errores[`calendario-${vigencia}-reteica-${numPeriodo}`]

                  return (
                    <div key={numPeriodo} className="rounded border border-slate-100 bg-slate-50/60 p-2.5">
                      <span className="block text-xs font-medium text-slate-700 mb-1">{nombre}</span>
                      <Input
                        type="date"
                        aria-label={`Vencimiento ${nombre}`}
                        disabled={!editable}
                        value={fechaActual}
                        onChange={(e) => cambiarFechaReteica(numPeriodo, e.target.value)}
                      />
                      {err && <span className="mt-1 block text-xs text-red-600">{err}</span>}
                    </div>
                  )
                })}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Interruptor
                  etiqueta="AutoReteICA comparte los mismos vencimientos de ReteICA"
                  ayuda="Actívalo si las autorretenciones se presentan en las mismas fechas que las retenciones."
                  valor={!tieneAutoIndependiente}
                  deshabilitado={!editable}
                  onChange={(comparten) => alternarAutoIndependiente(!comparten)}
                />

                {tieneAutoIndependiente && (
                  <div className="mt-4 space-y-3 pl-4 border-l-2 border-indigo-200">
                    <p className="text-xs font-medium text-slate-700">Vencimientos independientes para AutoReteICA:</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: periodosEsperados }).map((_, i) => {
                        const numPeriodo = i + 1
                        const nombre = nombresPeriodos[i] ?? `Periodo ${numPeriodo}`
                        const fechaActual = autoMap.get(numPeriodo) ?? ''
                        const err = errores[`calendario-${vigencia}-autorretencion-${numPeriodo}`]

                        return (
                          <div key={numPeriodo} className="rounded border border-slate-100 bg-slate-50/60 p-2.5">
                            <span className="block text-xs font-medium text-slate-700 mb-1">{nombre} (AutoReteICA)</span>
                            <Input
                              type="date"
                              aria-label={`Vencimiento AutoReteICA ${nombre}`}
                              disabled={!editable}
                              value={fechaActual}
                              onChange={(e) => cambiarFechaAutorretencion(numPeriodo, e.target.value)}
                            />
                            {err && <span className="mt-1 block text-xs text-red-600">{err}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Seccion>
  )
}
