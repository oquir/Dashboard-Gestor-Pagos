import { municipalityColor } from '../constants/styles'
import type { Declaration, Municipality, Payment } from '../types'

/** Recaudo del año en curso de un municipio, mes a mes, para el Reporte general. */
export interface GeneralCollectionRow {
  municipalityId: string
  name: string
  /** Color que identifica al municipio en ambos gráficos. */
  color: string
  /** Total recaudado en el año. */
  total: number
  /** Suma por mes: el índice 0 es enero y el 11, diciembre. */
  months: number[]
}

interface MonthlyCollectionInput {
  declarations: Declaration[]
  payments: Payment[]
  municipalities: Municipality[]
  year: number
}

/**
 * Une cada pago con su declaración para saber a qué municipio y a qué mes pertenece, y suma el
 * recaudo del año. Devuelve solo los municipios con recaudo, del mayor al menor.
 */
export function buildMonthlyCollection({
  declarations,
  payments,
  municipalities,
  year,
}: MonthlyCollectionInput): GeneralCollectionRow[] {
  const byId = new Map(declarations.map((d) => [d.id, d]))
  const monthsByMunicipality = new Map<string, number[]>()

  for (const p of payments) {
    if (!p.date.startsWith(String(year))) continue
    const declaration = byId.get(p.declarationId)
    if (!declaration) continue
    const months = monthsByMunicipality.get(declaration.municipalityId) ?? Array(12).fill(0)
    monthsByMunicipality.set(declaration.municipalityId, months)
    months[Number(p.date.slice(5, 7)) - 1] += p.value
  }

  const rows = municipalities.flatMap((m) => {
    const months = monthsByMunicipality.get(m.id)
    const total = months?.reduce((s, v) => s + v, 0) ?? 0
    if (!months || total <= 0) return []
    return [{ municipalityId: m.id, name: m.name, color: '', total, months }]
  })

  rows.sort((a, b) => b.total - a.total)
  return rows.map((row, i) => ({ ...row, color: municipalityColor(i) }))
}
