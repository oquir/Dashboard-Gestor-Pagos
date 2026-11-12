import { useState } from 'react'
import { ArrowUpRight } from 'reicon-react'
import { FORM_BUILDER_URL } from '../../../../constants'
import { taxLabel, goLiveText, can, useSession, TAXES } from '../../../../lib'
import { useData } from '../../../../store'
import type { Tax } from '../../../../types'
import { Card, Switch } from '../../../atoms'
import { CardHeader, DisabledBadge } from '../../../molecules'
import GoLiveModal from '../GoLiveModal'
import { GROUPS, LEGEND } from './MunicipalityForms.constants'
import type { MunicipalityFormsProps, FormOption } from './MunicipalityForms.types'

/**
 * Matriz de los formularios del municipio: cuáles gestiona y, para cada uno, su revisión y lo que recibe en la ventanilla.
 * La primera vez que se activa un formulario se pide su fecha de salida a producción.
 * De cada formulario que gestiona se abre el orquestador, en otra pestaña, para editarlo.
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

  return (
    <Card>
      <CardHeader
        title="Formularios"
        description="Qué formularios gestiona el municipio y, para cada uno, cómo se revisa y qué recibe en la ventanilla."
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="uppercase tracking-wide">
              <th rowSpan={2} scope="col" className="px-5 py-2 text-left align-bottom font-medium">
                Formulario
              </th>
              <th
                rowSpan={2}
                scope="col"
                className="px-3 py-2 text-center align-bottom font-medium"
              >
                Gestiona
              </th>
              {GROUPS.map((g) => (
                <th
                  key={g.title}
                  colSpan={g.options.length}
                  scope="colgroup"
                  className="border-l border-slate-200 px-3 pt-2 text-center font-medium"
                >
                  {g.title}
                </th>
              ))}
            </tr>
            <tr className="border-b border-slate-200">
              {GROUPS.map((g) =>
                g.options.map((o, j) => (
                  <th
                    key={o.key}
                    scope="col"
                    className={`px-3 pt-1 pb-2 text-center font-normal ${j === 0 ? 'border-l border-slate-200' : ''}`}
                  >
                    {o.text}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {TAXES.map((i) => {
              const manages = m.taxes[i]
              const pausa = manages ? pausas[i] : undefined
              return (
                <tr key={i} className={manages ? '' : 'bg-slate-50/70'}>
                  <th scope="row" className="px-5 py-3 text-left align-top font-medium">
                    <span className={manages ? 'text-slate-900' : 'text-slate-500'}>
                      {taxLabel[i]}
                    </span>
                    {pausa && (
                      <span className="ml-2 align-middle">
                        <DisabledBadge disabled={pausa} />
                      </span>
                    )}
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">
                      {goLiveText(m.inProductionSince[i])}
                    </span>
                    {manages && canOpenBuilder && (
                      // Por ahora abre el orquestador sin contexto; después llevará el municipio y quizá el impuesto.
                      <a
                        href={FORM_BUILDER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
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
                        className={`px-3 py-3 text-center align-top ${j === 0 ? 'border-l border-slate-100' : ''}`}
                      >
                        {manages ? (
                          <Switch
                            checked={checked(o.key, i)}
                            disabled={o.key === 'validateAgainstRit' && !m.rit}
                            title={
                              o.key === 'validateAgainstRit' && !m.rit
                                ? 'Requiere el RIT en el aplicativo'
                                : undefined
                            }
                            aria-label={`${o.text} en ${taxLabel[i]}`}
                            onChange={() => toggle[o.key](m.id, i)}
                          />
                        ) : (
                          <span className="text-slate-300">
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
      <dl className="grid gap-x-6 gap-y-3 border-t border-slate-100 p-5 text-xs sm:grid-cols-2">
        {LEGEND.map((l) => (
          <div key={l.searchTerm}>
            <dt className="font-medium text-slate-700">{l.searchTerm}</dt>
            <dd className="text-slate-500">{l.definition}</dd>
          </div>
        ))}
      </dl>

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
