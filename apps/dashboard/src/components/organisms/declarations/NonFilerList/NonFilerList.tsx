import { Download, InfoCircle, Warning } from 'reicon-react'
import { useCallback, useMemo, useState } from 'react'
import {
  downloadBlob,
  nonFilerSummons,
  summonsSituation,
  createXlsx,
  nonFilerId,
  can,
  useSession,
} from '../../../../lib'
import { useData } from '../../../../store'
import { today } from '../../../../utils'
import { Button, Card } from '../../../atoms'
import { Notice, FilterBar, SearchBox, CardHeader, Filter } from '../../../molecules'
import SummonsModal from '../SummonsModal'
import NonFilersTable from '../NonFilersTable'
import { EXCEL_COLUMNS, SUMMONS_OPTIONS } from './NonFilerList.constants'
import type { SummonsFilter, NonFilerListProps } from './NonFilerList.types'
import {
  recipientOf,
  summonsStatusOf,
  excelRow,
  filterNonFilers,
  yearOptions,
  fromText,
  noCalendarText,
  withoutZerosText,
} from './NonFilerList.utils'

/**
 * Los omisos del municipio que se está viendo: avisos de lo que no se pudo revisar, filtros por texto, año gravable y
 * emplazamiento, la tabla y la descarga en Excel de lo filtrado. El administrador y el funcionario marcan omisos y los
 * emplazan en lote.
 */
export default function NonFilerList({ result, tax }: NonFilerListProps) {
  const { user, municipalityId } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const summonses = useData((s) => s.summonses)
  const declarations = useData((s) => s.declarations)
  const [text, setText] = useState('')
  const [selectedYear, setYear] = useState('')
  const [summonsFilter, setSummonsFilter] = useState<SummonsFilter>('')
  const [selection, setSelection] = useState<ReadonlySet<string>>(new Set())
  const [summoning, setSummoning] = useState(false)
  const canSummon = can(user?.role, 'review')
  const date = today()

  const ofTax = result.nonFilers.filter((o) => !tax || o.tax === tax)
  const years = yearOptions(ofTax)
  // Si el año elegido ya no tiene omisos con el impuesto de la pestaña, se vuelve a "Todo año gravable".
  const year = selectedYear in years ? selectedYear : ''
  const filtered = filterNonFilers(ofTax, text, year).filter(
    (o) => !summonsFilter || summonsStatusOf(o, summonses, declarations, date) === summonsFilter,
  )
  const firstNames = new Map(municipalities.map((m) => [m.id, m.name]))

  // La selección sobrevive a los filtros, pero solo se emplazan los que siguen visibles y aún no tienen emplazamiento.
  const mark = useCallback((ids: string[], isChecked: boolean) => {
    setSelection((current) => {
      const newItem = new Set(current)
      for (const id of ids) {
        if (isChecked) newItem.add(id)
        else newItem.delete(id)
      }
      return newItem
    })
  }, [])
  const tableSelection = useMemo(() => ({ selection, mark }), [selection, mark])
  const checkedItems = filtered.filter(
    (o) => selection.has(nonFilerId(o)) && !nonFilerSummons(o, summonses),
  )

  const download = () => {
    const workbook = createXlsx({
      name: 'Omisos',
      rows: [
        EXCEL_COLUMNS.map((c) => c.title),
        ...filtered.map((o) => {
          const e = nonFilerSummons(o, summonses)
          return excelRow(
            o,
            firstNames,
            date,
            e && { e, status: summonsSituation(e, declarations, date).status },
          )
        }),
      ],
      widths: EXCEL_COLUMNS.map((c) => c.width),
      // El documento como texto, para que Excel no lo convierta en número.
      textColumns: [3],
    })
    downloadBlob(workbook, `omisos_${date}.xlsx`)
  }

  return (
    <div className="space-y-4">
      <Notice tone="info" icon={InfoCircle}>
        {fromText(municipalities.find((m) => m.id === municipalityId))}
      </Notice>
      {result.withoutCalendar.length > 0 && (
        <Notice tone="alert" icon={Warning} role="alert">
          {noCalendarText(result.withoutCalendar, firstNames, municipalityId === null)}
        </Notice>
      )}
      {result.withoutZeros > 0 && (!tax || tax === 'reteica') && (
        <Notice tone="neutral" icon={InfoCircle}>
          {withoutZerosText(result.withoutZeros)}
        </Notice>
      )}

      <Card>
        <CardHeader
          title="Omisos"
          description={
            canSummon
              ? 'Inscritos en el RIT que debían declarar un periodo ya vencido y no lo han hecho. Marca los que el municipio emplazó para registrar el emplazamiento.'
              : 'Inscritos en el RIT que debían declarar un periodo ya vencido y no lo han hecho.'
          }
        />
        <FilterBar
          searchBox={
            <SearchBox
              placeholder="Buscar por nombre, NIT o cédula, o número de RIT"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          }
          actions={
            <Button variant="primary" disabled={filtered.length === 0} onClick={download}>
              <Download className="size-4" aria-hidden /> Descargar Excel
            </Button>
          }
        >
          <Filter label="Año gravable" options={years} value={year} change={setYear} />
          <Filter
            label="Emplazamiento"
            options={SUMMONS_OPTIONS}
            value={summonsFilter}
            change={setSummonsFilter}
          />
        </FilterBar>
        {canSummon && checkedItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-brand-100 bg-brand-50 px-4 py-2.5 text-sm">
            <span className="font-medium text-brand-800">
              {checkedItems.length}{' '}
              {checkedItems.length === 1 ? 'omiso seleccionado' : 'omisos seleccionados'}
            </span>
            <Button variant="primary" onClick={() => setSummoning(true)}>
              Emplazar para declarar
            </Button>
            <Button variant="ghost" onClick={() => setSelection(new Set())}>
              Quitar selección
            </Button>
          </div>
        )}
        <NonFilersTable
          nonFilers={filtered}
          total={ofTax.length}
          selection={canSummon ? tableSelection : undefined}
        />
      </Card>

      {summoning && (
        <SummonsModal
          kind="file"
          recipients={checkedItems.map(recipientOf)}
          close={() => setSummoning(false)}
        />
      )}
    </div>
  )
}
