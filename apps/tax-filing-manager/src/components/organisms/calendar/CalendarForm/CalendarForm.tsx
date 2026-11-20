import { useState } from 'react'
import { toast } from 'sonner'
import { ALL_ACTIVE } from '../../../../constants'
import { withUploads, calendarErrors, fullName, useSession, TAXES } from '../../../../lib'
import { useData } from '../../../../store'
import type { MunicipalityConfig, FiscalYearCalendar } from '../../../../types'
import { today } from '../../../../utils'
import { SaveBar, ReasonModal  } from '../../../molecules'
import CalendarSection from '../CalendarSection'
import EarlyPaymentSection from '../EarlyPaymentSection'
import type { CalendarFormProps } from './CalendarForm.types'

/**
 * Vencimientos y pronto pago del municipio como borrador: se validan mientras se editan y al final se guardan
 * o se descartan. Solo guarda esas dos partes; lo demás de la configuración se cambia en Configuración.
 */
export default function CalendarForm({ config, editable }: CalendarFormProps) {
  const saveSettings = useData((s) => s.saveSettings)
  const { user } = useSession()
  // Solo se ponen fechas de los formularios que el municipio tiene activos (los define 1cero1).
  const taxes =
    useData((s) => s.municipalities.find((m) => m.id === config.municipalityId)?.taxes) ??
    ALL_ACTIVE
  const [b, setB] = useState(config)
  /** Ventana del motivo: solo se abre al guardar un calendario que ya tenía fechas guardadas. */
  const [asking, setAsking] = useState(false)
  const change = (partial: Partial<MunicipalityConfig>) => {
    setB((current) => ({ ...current, ...partial }))
  }

  const errors = calendarErrors(b, taxes)
  const modification = JSON.stringify(b) !== JSON.stringify(config)
  const editing = { b, change, editable, errors }

  const calendarChanged = JSON.stringify(b.taxCalendar) !== JSON.stringify(config.taxCalendar)
  const hadDates = config.taxCalendar.byFiscalYear.some((c) =>
    TAXES.some((t) => c[t].periods.some((p) => p.dates.some(Boolean))),
  )
  const asksReason = calendarChanged && hadDates

  const withReason = (reason: string): FiscalYearCalendar[] =>
    b.taxCalendar.byFiscalYear.map((c) => {
      const prior = config.taxCalendar.byFiscalYear.find((x) => x.fiscalYear === c.fiscalYear)
      if (!prior || JSON.stringify(prior) === JSON.stringify(c)) return c
      return { ...c, changeReason: { reason, date: today(), by: user ? fullName(user) : '' } }
    })

  const save = (reason?: string) => {
    const taxCalendar = {
      byFiscalYear: withUploads(
        reason ? withReason(reason) : b.taxCalendar.byFiscalYear,
        user ? fullName(user) : '',
        today(),
      ),
    }
    saveSettings({ ...config, taxCalendar, earlyPayment: b.earlyPayment })
    setB((current) => ({ ...current, taxCalendar }))
    setAsking(false)
    toast.success('Calendario guardado.')
  }

  return (
    <div className="space-y-6">
      <CalendarSection {...editing} taxes={taxes} config={config} />
      {/* El pronto pago es del ICA anual: sin ese impuesto activo no hay descuento que poner. */}
      {taxes.ica && <EarlyPaymentSection {...editing} />}

      {editable && (
        <SaveBar
          modification={modification}
          hasErrors={Object.keys(errors).length > 0}
          onDiscard={() => setB(config)}
          onSave={() => (asksReason ? setAsking(true) : save())}
        />
      )}
       {asking && (
        <ReasonModal
          title="Guardar cambios en el calendario"
          description="Estás modificando un calendario que ya tenía datos guardados. Indica el motivo del cambio o el nuevo decreto para dejar registro."
          label="Motivo del cambio"
          placeholder="Ej.: se actualizaron las fechas según la nueva resolución municipal."
          confirm="Guardar cambio"
          onConfirm={(reason) => save(reason)}
          close={() => setAsking(false)}
        />
      )}
    </div>
  )
}
