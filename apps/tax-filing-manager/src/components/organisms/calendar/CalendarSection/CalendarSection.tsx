import { DocumentText, Plus, Xmark } from 'reicon-react'
import { useState } from 'react'
import { FISCAL_YEAR_INFO, ONGOING_YEAR } from '../../../../constants'
import { newCalendar, taxLabel, formatDate, TAXES, calendarBlob } from '../../../../lib'
import { useData } from '../../../../store'
import type { FiscalYearCalendar } from '../../../../types'
import { Button, Input, Select } from '../../../atoms'
import { Notice, Field, Section } from '../../../molecules'
import DueDatesTable from '../DueDatesTable'
import { DECREE_INFO, FORM_DESCRIPTION } from './CalendarSection.constants'
import type { CalendarSectionProps } from './CalendarSection.types'
import {
  yearsToAdd,
  nearestCalendar,
  formErrors,
  addedText,
  otherFrequencyText,
  formsWithDates,
  discountTiers,
} from './CalendarSection.utils'
import PdfPreviewModal from '../../declarations/PdfPreviewModal'

/** Vencimientos de cada año gravable, también de años pasados: un calendario por cada formulario activo del municipio. */
export default function CalendarSection({
  b,
  change,
  editable,
  errors,
  taxes,
  config,
}: CalendarSectionProps) {
  const declarations = useData((s) => s.declarations)
  const municipality = useData((s) => s.municipalities.find((m) => m.id === b.municipalityId))
  const calendars = b.taxCalendar.byFiscalYear
  const fiscalYears = calendars.map((c) => c.fiscalYear).sort((x, y) => y - x)
  const [picked, setPicked] = useState<number>()
  const fiscalYear =
    picked !== undefined && fiscalYears.includes(picked)
      ? picked
      : fiscalYears.includes(ONGOING_YEAR)
        ? ONGOING_YEAR
        : fiscalYears[0]
  const cal = calendars.find((c) => c.fiscalYear === fiscalYear)

  // Lo que se guardó, no el borrador: el PDF es del calendario guardado del año que se ve.
  const saved = config.taxCalendar.byFiscalYear.find((c) => c.fiscalYear === fiscalYear)
  const forms = formsWithDates(saved, taxes)
  const tiers = discountTiers(config, fiscalYear, taxes)
  const [pdf, setPdf] = useState<Blob | Promise<Blob>>()

  const available = yearsToAdd(fiscalYears)
  const [newSelected, setNewSelected] = useState<number>()
  const newValue =
    newSelected !== undefined && available.includes(newSelected) ? newSelected : available[0]
  const [notice, setNotice] = useState<string>()

  const changeList = (byFiscalYear: FiscalYearCalendar[]) =>
    change({ taxCalendar: { byFiscalYear } })
  const changeCal = (partial: Partial<FiscalYearCalendar>) =>
    changeList(calendars.map((c) => (c.fiscalYear === fiscalYear ? { ...c, ...partial } : c)))

  const add = () => {
    if (newValue === undefined) return
    const base = nearestCalendar(calendars, newValue)
    changeList([...calendars, newCalendar(newValue, base)])
    setPicked(newValue)
    setNotice(addedText(newValue, base))
  }
  const removeItem = () => {
    changeList(calendars.filter((c) => c.fiscalYear !== fiscalYear))
    setPicked(undefined)
    setNotice(undefined)
  }
  const withErrors = (v: number) =>
    Object.keys(errors).some((key) => key.startsWith(`calendario-${v}-`))

  return (
    <>
      <Section
        title="Vencimientos"
        description="Fechas límite para presentar y pagar cada formulario. Se pueden agregar años pasados para corregir sus fechas."
        actions={
          <Button
            variant="secondary"
            disabled={forms.length === 0}
            onClick={() => saved && setPdf(calendarBlob(saved, municipality, forms, tiers))}
          >
            <DocumentText className="size-4" aria-hidden /> PDF del calendario
          </Button>
        }
      >
        <div className="space-y-4 sm:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
            <div className="flex flex-wrap items-end gap-3">
              {fiscalYear !== undefined && (
                <Field label="Año gravable" info={FISCAL_YEAR_INFO}>
                  <Select
                    value={fiscalYear}
                    onChange={(e) => {
                      setPicked(Number(e.target.value))
                      setNotice(undefined)
                    }}
                  >
                    {fiscalYears.map((v) => (
                      <option key={v} value={v}>
                        Año gravable {v}
                        {withErrors(v) ? ' (revisar)' : ''}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              {editable && fiscalYear !== undefined && (
                <Button variant="ghost" onClick={removeItem}>
                  <Xmark className="size-4" aria-hidden /> Quitar {fiscalYear}
                </Button>
              )}
            </div>
            {editable && newValue !== undefined && (
              <div className="flex flex-wrap items-end gap-2">
                <Field label="Agregar año gravable">
                  <Select value={newValue} onChange={(e) => setNewSelected(Number(e.target.value))}>
                    {available.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Button onClick={add}>
                  <Plus className="size-4" aria-hidden /> Agregar
                </Button>
              </div>
            )}
          </div>

          {notice && (
            <Notice tone="info" role="status">
              {notice}
            </Notice>
          )}

          {fiscalYear === undefined || !cal ? (
            <p className="text-sm text-fg-muted">
              Aún no hay ningún año gravable en el calendario.
            </p>
          ) : (
            <div className="space-y-4">
              <Field
                label="Acto que fija el calendario"
                help={`Decreto o resolución del municipio para el año gravable ${fiscalYear}.`}
                info={DECREE_INFO}
              >
                <Input
                  value={cal.decree ?? ''}
                  disabled={!editable}
                  onChange={(e) => changeCal({ decree: e.target.value })}
                  placeholder="Ej.: Decreto 089 de 2026"
                />
              </Field>
              <p className="text-xs text-fg-muted">
                {cal.uploaded
                  ? `Cargado el ${formatDate(cal.uploaded.date)}${cal.uploaded.by ? ` por ${cal.uploaded.by}` : ''}. Las declaraciones de este año gravable presentadas antes quedan marcadas como presentadas sin calendario.`
                  : `Sin guardar: el año gravable ${fiscalYear} queda cargado cuando guardes.`}
              </p>
              {TAXES.filter((i) => taxes[i]).map((tax) => (
                <DueDatesTable
                  key={tax}
                  title={taxLabel[tax]}
                  description={FORM_DESCRIPTION[tax](fiscalYear)}
                  value={cal[tax]}
                  onChange={(value) => changeCal({ [tax]: value })}
                  editable={editable}
                  errors={formErrors(errors, fiscalYear, tax)}
                  frequencyNotice={otherFrequencyText(
                    declarations,
                    b.municipalityId,
                    tax,
                    fiscalYear,
                    cal[tax].frequency,
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </Section>
      {pdf && (
        <PdfPreviewModal
          blob={pdf}
          title={`Calendario de vencimientos ${fiscalYear}`}
          description={`Municipio de ${municipality?.name} · Año gravable ${fiscalYear}`}
          showOpen={false}
          showDownload={false}
          close={() => setPdf(undefined)}
        />
      )}
    </>
  )
}
