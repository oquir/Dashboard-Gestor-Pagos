import { useState } from 'react'
import { ArrowUpRight } from 'reicon-react'
import { FORM_BUILDER_URL } from '../../../../constants'
import { taxLabel, goLiveText, can, useSession, TAXES } from '../../../../lib'
import { useData } from '../../../../store'
import type { Tax } from '../../../../types'
import { Card, Switch } from '../../../atoms'
import { CardHeader, DisabledBadge, InfoTip, Tooltip } from '../../../molecules'
import GoLiveModal from '../GoLiveModal'
import { COLUMN_INFO, GROUPS } from './MunicipalityForms.constants'
import type { MunicipalityFormsProps, FormOption } from './MunicipalityForms.types'

/**
 * Matriz de los formularios del municipio: cuáles gestiona y, para cada uno, su revisión y lo que recibe en la ventanilla.
 * La primera vez que se activa un formulario se pide su fecha de salida a producción.
 * De cada formulario que gestiona se abre FormMaker, en otra pestaña, para editarlo.
 */
export default function MunicipalityForms({ municipality: m, pausas }: MunicipalityFormsProps) {
  const { user } = useSession()
  const canOpenBuilder = can(user?.role, 'openFormBuilder')
  const toggleTax = useData((s) => s.toggleTax)
  const enableForm = useData((s) => s.enableForm)
  /** El impuesto que se activa por primera vez, mientras se pide su fecha. */
  const [requesting, setRequesting] = useState<Tax | null>(null)
  const toggle: Record<FormOption, (municipalityId: string, tax: Tax) => void> = {
    validateAgainstRit: useData((s) => s.toggleRitValidation),
    priorApproval: useData((s) => s.togglePriorApproval),
    cashPayment: useData((s) => s.toggleCashPayment),
    checkPayment: useData((s) => s.toggleCheckPayment),
  }
  // Sin el RIT en el aplicativo no hay contra qué validar.
  const checked = (key: FormOption, i: Tax) =>
    key === 'validateAgainstRit' ? m.rit && m.validateAgainstRit[i] : m[key][i]
  const needsRit = (key: FormOption) => key === 'validateAgainstRit' && !m.rit

  return (
    <Card>
      <CardHeader
        title="Formularios"
        description="Qué formularios gestiona el municipio y, para cada uno, cómo se revisa y qué recibe en la ventanilla."
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="text-xs text-fg-muted">
            <tr className="uppercase tracking-wide">
              <th rowSpan={2} scope="col" className="px-5 py-2 text-left align-bottom font-medium">
                Formulario
              </th>
              <th
                rowSpan={2}
                scope="col"
                className="px-3 py-2 text-center align-bottom font-medium"
              >
                <span className="inline-flex items-center gap-1">
                  Gestiona
                  <InfoTip label="Gestiona" content={COLUMN_INFO.manages} placement="bottom" />
                </span>
              </th>
              {GROUPS.map((g) => (
                <th
                  key={g.title}
                  colSpan={g.options.length}
                  scope="colgroup"
                  className="border-l border-border px-3 pt-2 text-center font-medium"
                >
                  {g.title}
                </th>
              ))}
            </tr>
            <tr className="border-b border-border">
              {GROUPS.map((g) =>
                g.options.map((o, j) => (
                  <th
                    key={o.key}
                    scope="col"
                    className={`px-3 pt-1 pb-2 text-center font-normal ${j === 0 ? 'border-l border-border' : ''}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {o.text}
                      <InfoTip label={o.text} content={COLUMN_INFO[o.key]} placement="bottom" />
                    </span>
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {TAXES.map((i) => {
              const manages = m.taxes[i]
              const pausa = manages ? pausas[i] : undefined
              return (
                <tr key={i} className={manages ? '' : 'bg-surface-sunken/70'}>
                  <th scope="row" className="px-5 py-3 text-left align-top font-medium">
                    <span className={manages ? 'text-fg-strong' : 'text-fg-muted'}>
                      {taxLabel[i]}
                    </span>
                    {pausa && (
                      <span className="ml-2 align-middle">
                        <DisabledBadge disabled={pausa} />
                      </span>
                    )}
                    <span className="mt-0.5 block text-xs font-normal text-fg-muted">
                      {goLiveText(m.inProductionSince[i])}
                    </span>
                    {manages && canOpenBuilder && (
                      // Por ahora abre FormMaker sin contexto; después llevará el municipio y quizá el impuesto.
                      <a
                        href={FORM_BUILDER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-brand-fg hover:underline"
                      >
                        Editar formulario
                        <ArrowUpRight className="size-3.5" aria-hidden />
                        <span className="sr-only">
                          de {taxLabel[i]} (se abre en una pestaña nueva)
                        </span>
                      </a>
                    )}
                  </th>
                  <td className="px-3 py-3 text-center align-top">
                    <Switch
                      checked={manages}
                      aria-label={`Gestiona ${taxLabel[i]}`}
                      onChange={() =>
                        !manages && !m.inProductionSince[i] ? setRequesting(i) : toggleTax(m.id, i)
                      }
                    />
                  </td>
                  {GROUPS.map((g) =>
                    g.options.map((o, j) => (
                      <td
                        key={o.key}
                        className={`px-3 py-3 text-center align-top ${j === 0 ? 'border-l border-border-subtle' : ''}`}
                      >
                        {manages ? (
                          needsRit(o.key) ? (
                            // Un control deshabilitado no recibe eventos: el globo va en un span que sí se enfoca.
                            <Tooltip content="Requiere el RIT en el aplicativo">
                              <span tabIndex={0} className="inline-flex">
                                <Switch
                                  checked={false}
                                  disabled
                                  aria-label={`${o.text} en ${taxLabel[i]}`}
                                  onChange={() => undefined}
                                />
                              </span>
                            </Tooltip>
                          ) : (
                            <Switch
                              checked={checked(o.key, i)}
                              aria-label={`${o.text} en ${taxLabel[i]}`}
                              onChange={() => toggle[o.key](m.id, i)}
                            />
                          )
                        ) : (
                          <span className="text-fg-subtle">
                            <span aria-hidden>—</span>
                            <span className="sr-only">
                              No aplica: el municipio no gestiona este formulario
                            </span>
                          </span>
                        )}
                      </td>
                    )),
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {requesting && (
        <GoLiveModal
          form={requesting}
          onConfirm={(date) => {
            enableForm(m.id, requesting, date)
            setRequesting(null)
          }}
          close={() => setRequesting(null)}
        />
      )}
    </Card>
  )
}
