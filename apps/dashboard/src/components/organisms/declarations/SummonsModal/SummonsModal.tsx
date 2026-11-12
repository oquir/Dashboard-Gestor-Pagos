import { Document, Paperclip, Xmark } from 'reicon-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { DOCUMENT_FORMATS, MAX_FILE_SIZE } from '../../../../constants'
import { formatSize, saveFile } from '../../../../lib'
import { useData } from '../../../../store'
import type { NewSummons } from '../../../../types'
import { today } from '../../../../utils'
import { Button, Input } from '../../../atoms'
import { Field, Modal, FilePicker } from '../../../molecules'
import type { SummonsModalProps } from './SummonsModal.types'
import { dateError, numberError } from './SummonsModal.utils'

/**
 * Ventana para registrar emplazamientos que el municipio ya notificó: uno, o un lote de omisos con la misma fecha de
 * notificación. Cada uno lleva su número de acto y, si se quiere, la copia del acto.
 */
export default function SummonsModal({ kind, recipients, close }: SummonsModalProps) {
  const recordSummonses = useData((s) => s.recordSummonses)
  const existing = useData((s) => s.summonses)
  const [date, setDate] = useState(today())
  const [numbers, setNumbers] = useState<Record<string, string>>({})
  const [copies, setCopies] = useState<Record<string, File>>({})
  const [tooLarge, setTooLarge] = useState<string>()
  const [attempted, setAttempted] = useState(false)
  const [sending, setSending] = useState(false)

  const dateFails = dateError(date, today(), recipients, kind)
  const numberFails = (key: string) => numberError(key, numbers, recipients, existing)
  const several = recipients.length > 1

  const pickCopy = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_FILE_SIZE) return setTooLarge(key)
    setTooLarge(undefined)
    setCopies((currentOnes) => ({ ...currentOnes, [key]: file }))
  }
  const removeCopy = (key: string) =>
    setCopies((currentOnes) =>
      Object.fromEntries(Object.entries(currentOnes).filter(([k]) => k !== key)),
    )

  const send = async () => {
    setAttempted(true)
    if (dateFails || recipients.some((x) => numberFails(x.key))) return
    setSending(true)
    const newOnes = await Promise.all(
      recipients.map(async ({ key, destination }): Promise<NewSummons> => {
        const copy = copies[key] ? await saveFile(copies[key]) : undefined
        return { ...destination, number: numbers[key].trim(), notificationDate: date, copy }
      }),
    )
    recordSummonses(newOnes)
    close()
  }

  return (
    <Modal
      title={
        kind === 'file'
          ? `Emplazar para declarar${several ? ` a ${recipients.length} omisos` : ''}`
          : 'Registrar emplazamiento para corregir'
      }
      description={
        kind === 'file'
          ? 'Registra el emplazamiento que el municipio ya notificó. Tiene 1 mes para declarar, y desde la notificación la extemporaneidad es la del art. 642: la tasa tras emplazamiento de Configuración, hasta el 200 % del impuesto.'
          : 'Registra el emplazamiento que el municipio ya notificó. Tiene 1 mes para corregir, y desde la notificación toda corrección lleva la sanción del art. 644, numeral 2. No responder no genera sanción.'
      }
      close={close}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={sending} onClick={send}>
            Registrar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field
          label="Fecha de notificación"
          help={several ? 'La misma para todos los del lote.' : undefined}
          error={attempted ? dateFails : undefined}
        >
          <Input
            type="date"
            data-autofocus
            max={today()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <ul className="max-h-[50vh] divide-y divide-border-subtle overflow-y-auto rounded-lg ring-1 ring-border">
          {recipients.map(({ key, title, description }) => (
            <li key={key} className="space-y-2 px-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-fg-strong">{title}</p>
                <p className="truncate text-xs text-fg-muted">{description}</p>
              </div>
              <Field label="Número del acto" error={attempted ? numberFails(key) : undefined}>
                <Input
                  placeholder={kind === 'file' ? 'Ej.: EPD-2026-014' : 'Ej.: EPC-2026-007'}
                  value={numbers[key] ?? ''}
                  onChange={(e) =>
                    setNumbers((currentOnes) => ({ ...currentOnes, [key]: e.target.value }))
                  }
                />
              </Field>
              {copies[key] ? (
                <p className="flex items-center gap-2 text-sm text-fg">
                  <Document className="size-4 shrink-0 text-brand-fg" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{copies[key].name}</span>
                  <span className="shrink-0 text-xs text-fg-muted">
                    {formatSize(copies[key].size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCopy(key)}
                    className="rounded p-0.5 text-fg-subtle hover:bg-surface-raised hover:text-danger"
                    aria-label={`Quitar ${copies[key].name}`}
                  >
                    <Xmark className="size-4" aria-hidden />
                  </button>
                </p>
              ) : (
                <div>
                  <FilePicker
                    text="Adjuntar copia del acto"
                    icon={Paperclip}
                    accept={DOCUMENT_FORMATS}
                    onChange={pickCopy(key)}
                  />
                  <p
                    className={`mt-1 text-xs ${tooLarge === key ? 'text-danger' : 'text-fg-muted'}`}
                  >
                    {tooLarge === key
                      ? 'Supera los 10 MB y no se adjuntó.'
                      : 'Opcional. PDF, Word, Excel o imagen, hasta 10 MB.'}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
