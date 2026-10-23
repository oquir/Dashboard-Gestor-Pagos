import { Save, AlertTriangle, Plus, Xmark } from 'reicon-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Tabla from '../components/Tabla'
import { Boton, Campo, Card, CardHeader, Input, PageHeader, Select, Vacio } from '../components/ui'
import { formatoFecha, formatoPesos } from '../lib/formato'
import { puede } from '../lib/permisos'
import { ANTICIPO_MAXIMO, SANCIONES_LEY, TOPES_TARIFA, UVT } from '../lib/reglas'
import { useSesion } from '../lib/sesion'
import { ayudanteColumnas } from '../lib/tabla'
import { useDatos } from '../store'
import type { ConfigMunicipio, Tarifa, TramoProntoPago } from '../types'

const numero = (v: string) => (v === '' ? 0 : Number(v))

const ANIO_EN_CURSO = new Date().getFullYear()

const diaSiguiente = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}
const finDeMes = (iso: string) => new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), 0)).toISOString().slice(0, 10)
/** La misma fecha un año después; el 29 de febrero pasa al 28. */
const unAnioDespues = (iso: string) => iso && `${Number(iso.slice(0, 4)) + 1}${iso.slice(4)}`.replace(/-02-29$/, '-02-28')

/** Un tramo nuevo arranca el día siguiente al último y llega hasta fin de ese mes. */
function tramoNuevo(vigencia: number, tramos: TramoProntoPago[]): TramoProntoPago {
  const ultimo = tramos.map((t) => t.hasta).filter(Boolean).sort().at(-1)
  const desde = ultimo ? diaSiguiente(ultimo) : `${vigencia + 1}-01-01`
  return { desde, hasta: finDeMes(desde), porcentaje: tramos.at(-1)?.porcentaje ?? 10 }
}

function erroresTramos(vigencia: number, tramos: TramoProntoPago[]) {
  return tramos.map((t, i) => {
    if (!t.desde || !t.hasta) return 'Completa las dos fechas.'
    if (t.desde > t.hasta) return 'La fecha final es anterior a la inicial.'
    if (t.desde <= `${vigencia}-12-31`) return `El año gravable ${vigencia} se declara y paga desde ${vigencia + 1}.`
    if (t.porcentaje <= 0 || t.porcentaje > 100) return 'El descuento debe ser mayor que 0 y máximo 100 %.'
    const cruce = tramos.find((o, j) => j !== i && o.desde && o.hasta && o.desde <= t.hasta && t.desde <= o.hasta)
    return cruce && `Se cruza con el tramo del ${formatoFecha(cruce.desde)} al ${formatoFecha(cruce.hasta)}.`
  })
}

function fueraDeTope({ sector, porMil }: Tarifa) {
  if (sector === 'financiero') return false
  const [min, max] = TOPES_TARIFA[sector]
  return porMil < min || porMil > max
}

const col = ayudanteColumnas<Tarifa>()

function columnasTarifas(editable: boolean, cambiarTarifa: (ciiu: string, porMil: number) => void) {
  return col.columns([
    col.accessor('ciiu', { header: 'CIIU', meta: { clase: 'tabular-nums text-slate-500' } }),
    col.accessor('descripcion', { header: 'Actividad', meta: { clase: 'text-slate-900' } }),
    col.accessor('sector', { header: 'Sector', meta: { clase: 'capitalize text-slate-600' } }),
    col.accessor('porMil', {
      header: 'Tarifa (por mil)',
      // Sin ordenar: las filas saltarían de lugar mientras se escribe.
      enableSorting: false,
      meta: { clase: 'w-40' },
      cell: ({ row: { original: t } }) => (
        <>
          <Input
            type="number"
            step="0.1"
            min={0}
            aria-label={`Tarifa de ${t.descripcion}`}
            disabled={!editable}
            value={t.porMil}
            onChange={(e) => cambiarTarifa(t.ciiu, numero(e.target.value))}
          />
          {fueraDeTope(t) && (
            <p className="mt-1 flex items-center gap-1 text-xs text-amber-800">
              <AlertTriangle className="size-3" aria-hidden /> Fuera de los topes de ley
            </p>
          )}
        </>
      ),
    }),
  ])
}

const ETIQUETAS_SANCION: Record<keyof ConfigMunicipio['sanciones'], string> = {
  extemporaneidad: 'Extemporaneidad (% por mes)',
  extemporaneidadEmplazamiento: 'Extemporaneidad tras emplazamiento (% por mes)',
  correccion: 'Corrección (% del mayor valor)',
  correccionEmplazamiento: 'Corrección tras emplazamiento (%)',
  minimaUvt: 'Sanción mínima (UVT)',
}

function Interruptor({ etiqueta, ayuda, valor, onChange, deshabilitado }: { etiqueta: string; ayuda?: string; valor: boolean; onChange: (v: boolean) => void; deshabilitado: boolean }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" className="mt-0.5 size-4 accent-brand-600" checked={valor} disabled={deshabilitado} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-medium text-slate-700">{etiqueta}</span>
        {ayuda && <span className="block text-xs text-slate-500">{ayuda}</span>}
      </span>
    </label>
  )
}

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader titulo={titulo} descripcion={descripcion} />
      <div className="grid gap-5 p-5 sm:grid-cols-2">{children}</div>
    </Card>
  )
}

const COLUMNAS_TRAMO = 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_6rem_2.25rem] gap-2'

function ProntoPago({
  valor,
  onChange,
  errores,
  editable,
}: {
  valor: ConfigMunicipio['prontoPago']
  onChange: (valor: ConfigMunicipio['prontoPago']) => void
  errores: Record<string, string>
  editable: boolean
}) {
  const vigencias = valor.porVigencia.map((v) => v.vigencia).sort((a, b) => b - a)
  const [elegida, setElegida] = useState<number>()
  // Por defecto, el año gravable que se está declarando.
  const vigencia =
    elegida !== undefined && vigencias.includes(elegida) ? elegida : vigencias.includes(ANIO_EN_CURSO - 1) ? ANIO_EN_CURSO - 1 : vigencias[0]
  const tramos = valor.porVigencia.find((v) => v.vigencia === vigencia)?.tramos ?? []
  const conErrores = (v: number) => Object.keys(errores).some((clave) => clave.startsWith(`pronto-${v}-`))

  const cambiarTramos = (nuevos: TramoProntoPago[]) =>
    onChange({ ...valor, porVigencia: valor.porVigencia.map((v) => (v.vigencia === vigencia ? { ...v, tramos: nuevos } : v)) })
  const cambiarTramo = (i: number, parcial: Partial<TramoProntoPago>) => cambiarTramos(tramos.map((t, j) => (j === i ? { ...t, ...parcial } : t)))

  // El año nuevo copia los tramos del último, corridos un año: los concejos suelen repetir el esquema.
  const agregarVigencia = () => {
    const ultima = vigencias[0]
    const nueva = ultima === undefined ? ANIO_EN_CURSO - 1 : ultima + 1
    const copia = (valor.porVigencia.find((v) => v.vigencia === ultima)?.tramos ?? []).map((t) => ({
      ...t,
      desde: unAnioDespues(t.desde),
      hasta: unAnioDespues(t.hasta),
    }))
    onChange({ ...valor, porVigencia: [...valor.porVigencia, { vigencia: nueva, tramos: copia.length > 0 ? copia : [tramoNuevo(nueva, [])] }] })
    setElegida(nueva)
  }
  const quitarVigencia = () => {
    onChange({ ...valor, porVigencia: valor.porVigencia.filter((v) => v.vigencia !== vigencia) })
    setElegida(undefined)
  }

  return (
    <div className="ml-7 space-y-4 rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-end gap-3">
        {vigencia !== undefined && (
          <Campo etiqueta="Año gravable">
            <Select value={vigencia} onChange={(e) => setElegida(Number(e.target.value))}>
              {vigencias.map((v) => (
                <option key={v} value={v}>
                  {v}
                  {conErrores(v) ? ' (revisar)' : ''}
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
            Quitar {vigencia}
          </Boton>
        )}
      </div>

      {vigencia === undefined ? (
        <p className="text-sm text-slate-500">Aún no hay años gravables con descuento.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            El año gravable {vigencia} se declara en {vigencia + 1}. El descuento depende de la fecha de pago; por fuera de estos tramos no hay descuento.
          </p>
          {tramos.length === 0 ? (
            <p className="text-sm text-slate-500">Sin tramos: este año gravable no tiene descuento.</p>
          ) : (
            <div className={`${COLUMNAS_TRAMO} text-xs font-medium text-slate-500`}>
              <span>Pago desde</span>
              <span>Pago hasta</span>
              <span>Descuento (%)</span>
            </div>
          )}
          {tramos.map((t, i) => {
            const error = errores[`pronto-${vigencia}-${i}`]
            return (
              <div key={i}>
                <div className={`${COLUMNAS_TRAMO} items-center`}>
                  <Input type="date" aria-label={`Inicio del tramo ${i + 1}`} disabled={!editable} value={t.desde} onChange={(e) => cambiarTramo(i, { desde: e.target.value })} />
                  <Input type="date" aria-label={`Fin del tramo ${i + 1}`} disabled={!editable} value={t.hasta} onChange={(e) => cambiarTramo(i, { hasta: e.target.value })} />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    aria-label={`Descuento del tramo ${i + 1}`}
                    disabled={!editable}
                    value={t.porcentaje}
                    onChange={(e) => cambiarTramo(i, { porcentaje: numero(e.target.value) })}
                  />
                  {editable && (
                    <Boton variante="fantasma" className="px-2" aria-label={`Quitar el tramo ${i + 1}`} onClick={() => cambiarTramos(tramos.filter((_, j) => j !== i))}>
                      <Xmark className="size-4" aria-hidden />
                    </Boton>
                  )}
                </div>
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>
            )
          })}
          {editable && (
            <Boton onClick={() => cambiarTramos([...tramos, tramoNuevo(vigencia, tramos)])}>
              <Plus className="size-4" aria-hidden /> Agregar tramo
            </Boton>
          )}
        </div>
      )}
    </div>
  )
}

const TODOS_ACTIVOS = { ica: true, reteica: true, autorretencion: true }

function Formulario({ config, editable }: { config: ConfigMunicipio; editable: boolean }) {
  const guardarConfiguracion = useDatos((s) => s.guardarConfiguracion)
  // Solo se configura lo que el municipio tiene activo: impuestos y RIT (los define 1cero1).
  const municipio = useDatos((s) => s.municipios.find((m) => m.id === config.municipioId))
  const impuestos = municipio?.impuestos ?? TODOS_ACTIVOS
  const conRit = municipio?.rit ?? true
  const tituloRetencion =
    impuestos.reteica && impuestos.autorretencion ? 'ReteICA y AutoReteICA' : impuestos.reteica ? 'Retención (ReteICA)' : 'Autorretención (AutoReteICA)'
  const [b, setB] = useState(config)
  const [guardado, setGuardado] = useState(false)
  const cambiar = (parcial: Partial<ConfigMunicipio>) => {
    setB((actual) => ({ ...actual, ...parcial }))
    setGuardado(false)
  }
  const columnas = useMemo(
    () =>
      columnasTarifas(editable, (ciiu, porMil) => {
        setB((actual) => ({ ...actual, tarifas: actual.tarifas.map((t) => (t.ciiu === ciiu ? { ...t, porMil } : t)) }))
        setGuardado(false)
      }),
    [editable],
  )

  const errores: Record<string, string> = {}
  for (const clave of Object.keys(SANCIONES_LEY) as (keyof ConfigMunicipio['sanciones'])[]) {
    if (b.sanciones[clave] > SANCIONES_LEY[clave]) errores[clave] = `La ley fija como máximo ${SANCIONES_LEY[clave]}; el municipio solo puede bajarla.`
    if (b.sanciones[clave] < 0) errores[clave] = 'No puede ser negativa.'
  }
  if (b.anticipoPorcentaje > ANTICIPO_MAXIMO) errores.anticipo = `Máximo ${ANTICIPO_MAXIMO}% (art. 47 de la Ley 43 de 1987).`
  if (b.sobretasaBomberil.activa && b.sobretasaBomberil.porcentaje <= 0) errores.sobretasa = 'Debe ser mayor que 0; si no se cobra, desactívala.'
  if (b.prontoPago.activo) {
    for (const { vigencia, tramos } of b.prontoPago.porVigencia) {
      erroresTramos(vigencia, tramos).forEach((error, i) => {
        if (error) errores[`pronto-${vigencia}-${i}`] = error
      })
    }
  }
  const hayErrores = Object.keys(errores).length > 0
  const cambio = JSON.stringify(b) !== JSON.stringify(config)

  return (
    <div className="space-y-6">
      {(impuestos.reteica || impuestos.autorretencion) && (
        <Seccion titulo={tituloRetencion} descripcion="No hay formulario nacional: cada municipio define el suyo.">
          <Campo etiqueta="Periodicidad">
            <Select disabled={!editable} value={b.periodicidadRetencion} onChange={(e) => cambiar({ periodicidadRetencion: e.target.value as ConfigMunicipio['periodicidadRetencion'] })}>
              <option value="bimestral">Bimestral</option>
              <option value="mensual">Mensual</option>
            </Select>
          </Campo>
          {impuestos.reteica && (
            <>
              <Campo etiqueta="Tarifa de ReteICA">
                <Select disabled={!editable} value={b.reteica.modalidad} onChange={(e) => cambiar({ reteica: { ...b.reteica, modalidad: e.target.value as ConfigMunicipio['reteica']['modalidad'] } })}>
                  <option value="unica">Tarifa única</option>
                  <option value="actividad">Por actividad del proveedor</option>
                  <option value="concepto">Por concepto (compras / servicios)</option>
                </Select>
              </Campo>
              {b.reteica.modalidad === 'unica' && (
                <Campo etiqueta="Tarifa única (por mil)">
                  <Input type="number" step="0.1" min={0} disabled={!editable} value={b.reteica.tarifaUnicaPorMil} onChange={(e) => cambiar({ reteica: { ...b.reteica, tarifaUnicaPorMil: numero(e.target.value) } })} />
                </Campo>
              )}
              <Campo etiqueta="Base mínima de servicios (UVT)" ayuda={formatoPesos(b.reteica.baseMinimaServiciosUvt * UVT)}>
                <Input type="number" min={0} disabled={!editable} value={b.reteica.baseMinimaServiciosUvt} onChange={(e) => cambiar({ reteica: { ...b.reteica, baseMinimaServiciosUvt: numero(e.target.value) } })} />
              </Campo>
              <Campo etiqueta="Base mínima de compras (UVT)" ayuda={formatoPesos(b.reteica.baseMinimaComprasUvt * UVT)}>
                <Input type="number" min={0} disabled={!editable} value={b.reteica.baseMinimaComprasUvt} onChange={(e) => cambiar({ reteica: { ...b.reteica, baseMinimaComprasUvt: numero(e.target.value) } })} />
              </Campo>
            </>
          )}
          {impuestos.autorretencion && (
            <>
              <Campo etiqueta="Tarifa de AutoReteICA">
                <Select disabled={!editable} value={b.autorretencion.modalidad} onChange={(e) => cambiar({ autorretencion: { ...b.autorretencion, modalidad: e.target.value as ConfigMunicipio['autorretencion']['modalidad'] } })}>
                  <option value="plena">Tarifa plena del ICA</option>
                  <option value="porcentaje">Porcentaje de la tarifa</option>
                </Select>
              </Campo>
              {b.autorretencion.modalidad === 'porcentaje' && (
                <Campo etiqueta="Porcentaje de la tarifa (%)">
                  <Input type="number" min={0} max={100} disabled={!editable} value={b.autorretencion.porcentaje} onChange={(e) => cambiar({ autorretencion: { ...b.autorretencion, porcentaje: numero(e.target.value) } })} />
                </Campo>
              )}
            </>
          )}
          {impuestos.reteica && impuestos.autorretencion && (
            <Interruptor etiqueta="Formulario conjunto de ReteICA y AutoReteICA" valor={b.formularioConjunto} deshabilitado={!editable} onChange={(v) => cambiar({ formularioConjunto: v })} />
          )}
          <Interruptor
            etiqueta="Exige declaración en ceros"
            ayuda="Si no, un agente sin retenciones en el periodo no declara y no se marca como omiso."
            valor={b.declaracionEnCeros}
            deshabilitado={!editable}
            onChange={(v) => cambiar({ declaracionEnCeros: v })}
          />
        </Seccion>
      )}

      {impuestos.ica && (
        <Seccion titulo="ICA anual" descripcion="Beneficios y cobros que fija el concejo municipal.">
          <div className="space-y-3 sm:col-span-2">
            <Interruptor
              etiqueta="Descuento por pronto pago"
              ayuda="Por año gravable, en tramos según la fecha de pago. Solo sobre el impuesto neto; se pierde con pago parcial o extemporáneo."
              valor={b.prontoPago.activo}
              deshabilitado={!editable}
              onChange={(v) => cambiar({ prontoPago: { ...b.prontoPago, activo: v } })}
            />
            {b.prontoPago.activo && <ProntoPago valor={b.prontoPago} onChange={(prontoPago) => cambiar({ prontoPago })} errores={errores} editable={editable} />}
          </div>
          <Campo etiqueta="Anticipo del año siguiente (%)" ayuda="0 si el municipio no lo exige." error={errores.anticipo}>
            <Input type="number" min={0} max={ANTICIPO_MAXIMO} disabled={!editable} value={b.anticipoPorcentaje} onChange={(e) => cambiar({ anticipoPorcentaje: numero(e.target.value) })} />
          </Campo>
          <div className="space-y-3">
            <Interruptor
              etiqueta="Sobretasa bomberil"
              ayuda="Se cobra en el renglón 23 como porcentaje del impuesto de industria y comercio."
              valor={b.sobretasaBomberil.activa}
              deshabilitado={!editable}
              onChange={(v) => cambiar({ sobretasaBomberil: { ...b.sobretasaBomberil, activa: v } })}
            />
            {b.sobretasaBomberil.activa && (
              <div className="ml-7">
                <Campo etiqueta="Porcentaje de la sobretasa (% del ICA)" error={errores.sobretasa}>
                  <Input type="number" min={0} step="0.1" disabled={!editable} value={b.sobretasaBomberil.porcentaje} onChange={(e) => cambiar({ sobretasaBomberil: { ...b.sobretasaBomberil, porcentaje: numero(e.target.value) } })} />
                </Campo>
              </div>
            )}
          </div>
        </Seccion>
      )}

      <Seccion titulo={conRit ? 'Procedimiento y RIT' : 'Procedimiento'}>
        <Campo etiqueta="Corrección a la baja">
          <Select disabled={!editable} value={b.correccionABaja} onChange={(e) => cambiar({ correccionABaja: e.target.value as ConfigMunicipio['correccionABaja'] })}>
            <option value="proyecto_589">Proyecto de corrección (art. 589 clásico)</option>
            <option value="correccion_directa">Corrección directa (Ley 1819 de 2016)</option>
          </Select>
        </Campo>
        {conRit && (
          <>
            <Campo etiqueta="Plazo para inscribirse en el RIT (meses desde el inicio de actividades)">
              <Input type="number" min={0} disabled={!editable} value={b.plazoInscripcionMeses} onChange={(e) => cambiar({ plazoInscripcionMeses: numero(e.target.value) })} />
            </Campo>
            <Interruptor
              etiqueta="Cancelación automática del RIT"
              ayuda="Si está apagado, la administración verifica el cese antes de aprobar la cancelación."
              valor={b.cancelacionRitAutomatica}
              deshabilitado={!editable}
              onChange={(v) => cambiar({ cancelacionRitAutomatica: v })}
            />
          </>
        )}
      </Seccion>

      <Seccion titulo="Funcionarios" descripcion="Lo que ven los funcionarios del municipio en Inicio.">
        <Interruptor
          etiqueta="Ocultar el recaudo del municipio"
          ayuda="Encendido, los funcionarios no ven en Inicio el recaudo del año ni la gráfica de recaudo por años."
          valor={b.ocultarRecaudoAFuncionarios}
          deshabilitado={!editable}
          onChange={(v) => cambiar({ ocultarRecaudoAFuncionarios: v })}
        />
      </Seccion>

      <Seccion titulo="Sanciones" descripcion="La ley es el tope: el municipio solo puede bajarlas (art. 59 de la Ley 788 de 2002).">
        {(Object.keys(ETIQUETAS_SANCION) as (keyof ConfigMunicipio['sanciones'])[]).map((clave) => (
          <Campo key={clave} etiqueta={ETIQUETAS_SANCION[clave]} ayuda={`Máximo de ley: ${SANCIONES_LEY[clave]}`} error={errores[clave]}>
            <Input type="number" min={0} step="0.5" disabled={!editable} value={b.sanciones[clave]} onChange={(e) => cambiar({ sanciones: { ...b.sanciones, [clave]: numero(e.target.value) } })} />
          </Campo>
        ))}
      </Seccion>

      <Card>
        <CardHeader titulo="Tarifas por actividad" descripcion="Por mil. Topes de ley: industrial 2 a 7; comercial y servicios 2 a 10; el sector financiero tiene reglas propias." />
        <Tabla datos={b.tarifas} columnas={columnas} idFila={(t) => t.ciiu} densa claseFila={() => ''} />
      </Card>

      {editable && (
        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          {hayErrores && <span className="mr-auto text-sm text-red-700">Corrige los campos marcados antes de guardar.</span>}
          {guardado && <span className="mr-auto text-sm text-emerald-700">Configuración guardada.</span>}
          <Boton variante="secundario" disabled={!cambio} onClick={() => { setB(config); setGuardado(false) }}>
            Descartar cambios
          </Boton>
          <Boton variante="primario" disabled={!cambio || hayErrores} onClick={() => { guardarConfiguracion(b); setGuardado(true) }}>
            <Save className="size-4" aria-hidden /> Guardar
          </Boton>
        </div>
      )}
    </div>
  )
}

export default function Configuracion() {
  const { usuario, municipioId } = useSesion()
  const configuraciones = useDatos((s) => s.configuraciones)
  const municipios = useDatos((s) => s.municipios)
  const config = configuraciones.find((c) => c.municipioId === municipioId)
  const editable = puede(usuario?.rol, 'editarConfiguracion')

  return (
    <>
      <PageHeader
        titulo="Configuración del municipio"
        descripcion={
          config
            ? `${municipios.find((m) => m.id === municipioId)?.nombre}. ${editable ? '' : 'Solo lectura: la configuración la cambia el administrador del municipio.'}`
            : undefined
        }
      />
      {config ? (
        <Formulario key={config.municipioId} config={config} editable={editable} />
      ) : (
        <Card>
          <Vacio titulo="Elige un municipio" descripcion="Selecciona en la barra superior el municipio que quieres configurar." />
        </Card>
      )}
    </>
  )
}
