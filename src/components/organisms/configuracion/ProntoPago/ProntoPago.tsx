import { Plus, Xmark } from 'reicon-react'
import { useState } from 'react'
import { ANIO_EN_CURSO } from '../../../../constants'
import { numero, tramoNuevo, unAnioDespues } from '../../../../lib/configuracion'
import type { TramoProntoPago } from '../../../../types'
import { Boton, Input, Select } from '../../../atoms'
import { Campo } from '../../../molecules'
import { COLUMNAS_TRAMO } from './constants'
import type { ProntoPagoProps } from './types'

/** Tramos de descuento por pronto pago de cada año gravable. */
export default function ProntoPago({ valor, onChange, errores, editable }: ProntoPagoProps) {
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
    <div className="ml-12 space-y-4 rounded-lg border border-slate-200 p-4">
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
