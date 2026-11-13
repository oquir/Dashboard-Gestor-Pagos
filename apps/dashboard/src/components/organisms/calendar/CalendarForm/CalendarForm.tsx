import { useState } from 'react'
import { toast } from 'sonner'
import { ALL_ACTIVE } from '../../../../constants'
import { withUploads, calendarErrors, fullName, useSession } from '../../../../lib'
import { useData } from '../../../../store'
import type { MunicipalityConfig } from '../../../../types'
import { today } from '../../../../utils'
import { SaveBar } from '../../../molecules'
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
  const change = (partial: Partial<MunicipalityConfig>) => {
    setB((current) => ({ ...current, ...partial }))
  }

  const errors = calendarErrors(b, taxes)
  const modification = JSON.stringify(b) !== JSON.stringify(config)
  const editing = { b, change, editable, errors }

  return (
    <div className="space-y-6">
      <CalendarSection {...editing} taxes={taxes} />
      {/* El pronto pago es del ICA anual: sin ese impuesto activo no hay descuento que poner. */}
      {taxes.ica && <EarlyPaymentSection {...editing} />}

      {editable && (
        <SaveBar
          modification={modification}
          hasErrors={Object.keys(errors).length > 0}
          onDiscard={() => setB(config)}
          onSave={() => {
            // Los años que se agregaron quedan cargados hoy: lo que se presentó antes queda marcado como presentado sin calendario.
            const taxCalendar = {
              byFiscalYear: withUploads(
                b.taxCalendar.byFiscalYear,
                user ? fullName(user) : '',
                today(),
              ),
            }
            saveSettings({ ...config, taxCalendar, earlyPayment: b.earlyPayment })
            setB((current) => ({ ...current, taxCalendar }))
            toast.success('Calendario guardado.')
          }}
        />
      )}
    </div>
  )
}
