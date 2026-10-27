import { useMemo, useState } from 'react'
import { MESES } from '../../../../lib/formato'
import { delMunicipio, IMPUESTOS, impuestoActivo, impuestosVisibles, useDeclaraciones, useSesion } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import type { FilaRecaudo } from '../../../../types'
import { totalRecaudo } from '../../../../utils'
import { Segmentado } from '../../../molecules'
import GraficoRecaudo from '../../GraficoRecaudo'
import { BIMESTRES, VISTAS } from './constants'
import type { RecaudoAnualProps, Vista } from './types'

/** Recaudo del año elegido, por mes o por bimestre: el año en curso sale de los pagos; los anteriores, del histórico. */
export default function RecaudoAnual({ anioActual }: RecaudoAnualProps) {
  const { municipioId } = useSesion()
  const declaraciones = useDeclaraciones()
  const municipios = useDatos((s) => s.municipios)
  const pagos = useDatos((s) => s.pagos)
  const recaudoHistorico = useDatos((s) => s.recaudoHistorico)
  const [anio, setAnio] = useState(anioActual)
  const [vista, setVista] = useState<Vista>('bimestral')
  const visibles = useMemo(() => impuestosVisibles(municipios, municipioId), [municipios, municipioId])
  /** El año en curso y los tres anteriores. */
  const anios = [anioActual, anioActual - 1, anioActual - 2, anioActual - 3]

  const meses = useMemo(() => {
    const filas: FilaRecaudo[] = MESES.map((etiqueta) => ({ etiqueta, valores: { ica: 0, reteica: 0, autorretencion: 0 } }))
    if (anio === anioActual) {
      const porId = new Map(declaraciones.map((d) => [d.id, d]))
      for (const p of pagos) {
        const d = porId.get(p.declaracionId)
        if (d && p.fecha.startsWith(String(anio))) filas[Number(p.fecha.slice(5, 7)) - 1].valores[d.impuesto] += p.valor
      }
    } else {
      const activo = impuestoActivo(municipios)
      for (const r of delMunicipio(recaudoHistorico, municipioId)) {
        if (r.anio !== anio) continue
        for (const i of IMPUESTOS) if (activo({ municipioId: r.municipioId, impuesto: i })) filas[r.mes - 1].valores[i] += r.valores[i]
      }
    }
    return filas
  }, [anio, anioActual, declaraciones, pagos, recaudoHistorico, municipios, municipioId])

  const filas = useMemo(() => {
    const porVista =
      vista === 'mensual'
        ? meses
        : BIMESTRES.map((etiqueta, b) => {
            const [a, c] = [meses[b * 2], meses[b * 2 + 1]]
            return { etiqueta, valores: { ica: a.valores.ica + c.valores.ica, reteica: a.valores.reteica + c.valores.reteica, autorretencion: a.valores.autorretencion + c.valores.autorretencion } }
          })
    // En el año en curso la gráfica llega hasta el último periodo con recaudo.
    return anio === anioActual ? porVista.slice(0, porVista.findLastIndex((f) => totalRecaudo(f) > 0) + 1) : porVista
  }, [meses, vista, anio, anioActual])

  return (
    <GraficoRecaudo
      titulo={`Recaudo ${anio} por ${vista === 'mensual' ? 'mes' : 'bimestre'}`}
      descripcion="Pagos recibidos según su fecha, por impuesto."
      filas={filas}
      impuestos={visibles}
      controles={
        <>
          <Segmentado etiqueta="Periodicidad" compacto opciones={VISTAS} valor={vista} cambiar={setVista} />
          <Segmentado etiqueta="Año" compacto opciones={anios.map((a) => ({ valor: a, texto: String(a) }))} valor={anio} cambiar={setAnio} />
        </>
      }
    />
  )
}
