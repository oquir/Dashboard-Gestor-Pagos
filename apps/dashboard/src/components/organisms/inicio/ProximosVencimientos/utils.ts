import { rangoFechas } from '../../../../lib/calendario'
import { etiquetaImpuesto, etiquetaPeriodo } from '../../../../lib/formato'
import { IMPUESTOS } from '../../../../lib/sesion'
import type { ConfigMunicipio, Municipio } from '../../../../types'
import { diferenciaDias } from '../../../../utils'
import type { VencimientoProximo } from './types'
import { CUANTOS, DIAS_VENCIDO } from './constants'

/**
 * Vencimientos más cercanos de los formularios activos del municipio (o de todos, si no hay uno elegido):
 * los que vienen y los que vencieron hace poco, del más cercano al más lejano.
 */
export function vencimientosProximos(
  configuraciones: ConfigMunicipio[],
  municipios: Municipio[],
  municipioId: string | null,
  hoy: string,
) {
  const lista: VencimientoProximo[] = []
  for (const cfg of configuraciones) {
    if (municipioId && cfg.municipioId !== municipioId) continue
    const activos = municipios.find((m) => m.id === cfg.municipioId)?.impuestos
    for (const cal of cfg.calendarioTributario.porVigencia) {
      for (const impuesto of IMPUESTOS.filter((i) => activos?.[i])) {
        const f = cal[impuesto]
        for (const p of f.periodos) {
          const rango = rangoFechas(f, p)
          if (!rango) continue
          lista.push({
            id: `${cfg.municipioId}-${cal.vigencia}-${impuesto}-${p.periodo}`,
            impuesto: etiquetaImpuesto[impuesto],
            periodoTexto: etiquetaPeriodo({
              impuesto,
              periodicidad: f.periodicidad,
              vigencia: cal.vigencia,
              periodo: p.periodo,
            }),
            fecha: rango.desde,
            hasta: rango.hasta !== rango.desde ? rango.hasta : undefined,
            decreto: cal.decreto,
            diasRestantes: diferenciaDias(hoy, rango.desde),
            diasHasta: diferenciaDias(hoy, rango.hasta),
          })
        }
      }
    }
  }
  return lista
    .filter((v) => v.diasHasta >= -DIAS_VENCIDO)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, CUANTOS)
}
