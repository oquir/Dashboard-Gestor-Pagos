import { Plus, Xmark } from 'reicon-react'
import { useState } from 'react'
import { ANIO_EN_CURSO } from '../../../../constants'
import { calendarioNuevo } from '../../../../lib/calendario'
import { etiquetaImpuesto, formatoFecha } from '../../../../lib/formato'
import { IMPUESTOS } from '../../../../lib/sesion'
import type { CalendarioVigencia } from '../../../../types'
import { Boton, Input, Select } from '../../../atoms'
import { Aviso, Campo, Seccion } from '../../../molecules'
import TablaVencimientos from '../TablaVencimientos'
import { DESCRIPCION_FORMULARIO } from './constants'
import type { SeccionCalendarioProps } from './types'
import { aniosParaAgregar, calendarioMasCercano, erroresDelFormulario, textoAgregado } from './utils'

/** Vencimientos de cada año gravable, también de años pasados: un calendario por cada formulario activo del municipio. */
export default function SeccionCalendario({ b, cambiar, editable, errores, impuestos }: SeccionCalendarioProps) {
  const calendarios = b.calendarioTributario.porVigencia
  const vigencias = calendarios.map((c) => c.vigencia).sort((x, y) => y - x)
  const [elegida, setElegida] = useState<number>()
  const vigencia = elegida !== undefined && vigencias.includes(elegida) ? elegida : vigencias.includes(ANIO_EN_CURSO) ? ANIO_EN_CURSO : vigencias[0]
  const cal = calendarios.find((c) => c.vigencia === vigencia)

  const disponibles = aniosParaAgregar(vigencias)
  const [nuevoElegido, setNuevoElegido] = useState<number>()
  const nuevo = nuevoElegido !== undefined && disponibles.includes(nuevoElegido) ? nuevoElegido : disponibles[0]
  const [aviso, setAviso] = useState<string>()

  const cambiarLista = (porVigencia: CalendarioVigencia[]) => cambiar({ calendarioTributario: { porVigencia } })
  const cambiarCal = (parcial: Partial<CalendarioVigencia>) => cambiarLista(calendarios.map((c) => (c.vigencia === vigencia ? { ...c, ...parcial } : c)))

  const agregar = () => {
    if (nuevo === undefined) return
    const base = calendarioMasCercano(calendarios, nuevo)
    cambiarLista([...calendarios, calendarioNuevo(nuevo, base)])
    setElegida(nuevo)
    setAviso(textoAgregado(nuevo, base))
  }
  const quitar = () => {
    cambiarLista(calendarios.filter((c) => c.vigencia !== vigencia))
    setElegida(undefined)
    setAviso(undefined)
  }
  const conErrores = (v: number) => Object.keys(errores).some((clave) => clave.startsWith(`calendario-${v}-`))

  return (
    <Seccion
      titulo="Vencimientos"
      descripcion="Fechas límite para presentar y pagar cada formulario. Se pueden agregar años pasados para corregir sus fechas."
    >
      <div className="space-y-4 sm:col-span-2">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-end gap-3">
            {vigencia !== undefined && (
              <Campo etiqueta="Año gravable">
                <Select value={vigencia} onChange={(e) => { setElegida(Number(e.target.value)); setAviso(undefined) }}>
                  {vigencias.map((v) => (
                    <option key={v} value={v}>
                      Año gravable {v}
                      {conErrores(v) ? ' (revisar)' : ''}
                    </option>
                  ))}
                </Select>
              </Campo>
            )}
            {editable && vigencia !== undefined && (
              <Boton variante="fantasma" onClick={quitar}>
                <Xmark className="size-4" aria-hidden /> Quitar {vigencia}
              </Boton>
            )}
          </div>
          {editable && nuevo !== undefined && (
            <div className="flex flex-wrap items-end gap-2">
              <Campo etiqueta="Agregar año gravable">
                <Select value={nuevo} onChange={(e) => setNuevoElegido(Number(e.target.value))}>
                  {disponibles.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </Select>
              </Campo>
              <Boton onClick={agregar}>
                <Plus className="size-4" aria-hidden /> Agregar
              </Boton>
            </div>
          )}
        </div>

        {aviso && (
          <Aviso tono="info" rol="status">
            {aviso}
          </Aviso>
        )}

        {vigencia === undefined || !cal ? (
          <p className="text-sm text-slate-500">Aún no hay ningún año gravable en el calendario.</p>
        ) : (
          <div className="space-y-4">
            <Campo etiqueta="Acto que fija el calendario" ayuda={`Decreto o resolución del municipio para el año gravable ${vigencia}.`}>
              <Input value={cal.decreto ?? ''} disabled={!editable} onChange={(e) => cambiarCal({ decreto: e.target.value })} placeholder="Ej.: Decreto 089 de 2026" />
            </Campo>
            <p className="text-xs text-slate-500">
              {cal.cargado
                ? `Cargado el ${formatoFecha(cal.cargado.fecha)}${cal.cargado.por ? ` por ${cal.cargado.por}` : ''}. Las declaraciones de este año gravable presentadas antes quedan marcadas como presentadas sin calendario.`
                : `Sin guardar: el año gravable ${vigencia} queda cargado cuando guardes.`}
            </p>
            {IMPUESTOS.filter((i) => impuestos[i]).map((impuesto) => (
              <TablaVencimientos
                key={impuesto}
                titulo={etiquetaImpuesto[impuesto]}
                descripcion={DESCRIPCION_FORMULARIO[impuesto](vigencia)}
                valor={cal[impuesto]}
                onChange={(valor) => cambiarCal({ [impuesto]: valor })}
                editable={editable}
                errores={erroresDelFormulario(errores, vigencia, impuesto)}
              />
            ))}
          </div>
        )}
      </div>
    </Seccion>
  )
}
