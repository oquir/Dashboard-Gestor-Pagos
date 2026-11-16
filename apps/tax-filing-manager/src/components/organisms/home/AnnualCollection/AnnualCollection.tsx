import { useMemo, useState } from 'react'
import {
  MONTHS,
  ofMunicipality,
  TAXES,
  activeTax,
  visibleTaxes,
  useDeclarations,
  useSession,
} from '../../../../lib'
import { useData } from '../../../../store'
import type { CollectionRow } from '../../../../types'
import { totalCollection } from '../../../../utils'
import { SegmentedControl } from '../../../molecules'
import CollectionChart from '../../CollectionChart'
import { BIMONTHS, VIEWS } from './AnnualCollection.constants'
import type { AnnualCollectionProps, View } from './AnnualCollection.types'

/** Recaudo del año elegido, por mes o por bimestre: el año en curso sale de los pagos; los anteriores, del histórico. */
export default function AnnualCollection({ currentYear }: AnnualCollectionProps) {
  const { municipalityId } = useSession()
  const declarations = useDeclarations()
  const municipalities = useData((s) => s.municipalities)
  const payments = useData((s) => s.payments)
  const collectionHistory = useData((s) => s.collectionHistory)
  const [year, setYear] = useState(currentYear)
  const [view, setView] = useState<View>('bimonthly')
  const visible = useMemo(
    () => visibleTaxes(municipalities, municipalityId),
    [municipalities, municipalityId],
  )
  /** Los tres años anteriores y el año en curso, de menor a mayor. */
  const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear]

  const months = useMemo(() => {
    const rows: CollectionRow[] = MONTHS.map((label) => ({
      label,
      values: { ica: 0, reteica: 0, selfWithholding: 0 },
    }))
    if (year === currentYear) {
      const byId = new Map(declarations.map((d) => [d.id, d]))
      for (const p of payments) {
        const d = byId.get(p.declarationId)
        if (d && p.date.startsWith(String(year)))
          rows[Number(p.date.slice(5, 7)) - 1].values[d.tax] += p.value
      }
    } else {
      const isActive = activeTax(municipalities)
      for (const r of ofMunicipality(collectionHistory, municipalityId)) {
        if (r.year !== year) continue
        for (const i of TAXES)
          if (isActive({ municipalityId: r.municipalityId, tax: i }))
            rows[r.month - 1].values[i] += r.values[i]
      }
    }
    return rows
  }, [year, currentYear, declarations, payments, collectionHistory, municipalities, municipalityId])

  const rows = useMemo(() => {
    const byView =
      view === 'monthly'
        ? months
        : BIMONTHS.map((label, b) => {
            const [a, c] = [months[b * 2], months[b * 2 + 1]]
            return {
              label,
              values: {
                ica: a.values.ica + c.values.ica,
                reteica: a.values.reteica + c.values.reteica,
                selfWithholding: a.values.selfWithholding + c.values.selfWithholding,
              },
            }
          })
    // En el año en curso la gráfica llega hasta el último periodo con recaudo.
    return year === currentYear
      ? byView.slice(0, byView.findLastIndex((f) => totalCollection(f) > 0) + 1)
      : byView
  }, [months, view, year, currentYear])

  return (
    <CollectionChart
      title={`Recaudo ${year} por ${view === 'monthly' ? 'mes' : 'bimestre'}`}
      description="Pagos recibidos según su fecha, por impuesto."
      rows={rows}
      taxes={visible}
      controls={
        <SegmentedControl
          label="Periodicidad"
          compact
          options={VIEWS}
          value={view}
          change={setView}
        />
      }
      footer={
        <SegmentedControl
          label="Año"
          compact
          options={years.map((a) => ({ value: a, text: String(a) }))}
          value={year}
          change={setYear}
        />
      }
    />
  )
}
