import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Card } from '../../components/atoms'
import {
  FilterBar,
  SearchBox,
  Filter,
  ToggleGroup,
  DateQueryBar,
  EmptyState,
  PageHeader,
  SegmentedControl,
} from '../../components/molecules'
import {
  MunicipalitySearch,
  DeclarationsDownload,
  NonFilerList,
  DeclarationsTable,
} from '../../components/organisms'
import { APPROVAL_OPTIONS, CORRECTION_OPTIONS, CORRECTION_URL_VALUES } from '../../constants'
import {
  filedWithoutCalendar,
  inDateRange,
  documentFormat,
  currentCorrection,
  isDownwardCorrection,
  withRit,
  visibleTaxes,
  can,
  ritVisible,
  useApproval,
  useDeclarations,
  usePaymentStatus,
  useNonFilers,
  useDateQuery,
  useSession,
  useCorrectionApplication,
  replaced,
  totalPaid,
} from '../../lib'
import { useData } from '../../store'
import type {
  PaymentStatus,
  DeclarationRow,
  ApprovalFilter,
  CorrectionFilter,
  Tax,
  DeclarationKind,
  FilterValue,
  DeclarationsView,
} from '../../types'
import {
  PAYMENT_OPTIONS,
  TYPE_OPTIONS,
  TABS,
  VIEWS,
  CRITERION,
  NO_QUERY,
} from './Declarations.constants'

export default function Declarations() {
  const { user, municipalityId } = useSession()
  const canSeeAll = can(user?.role, 'canSeeAllMunicipalities')
  const declarations = useDeclarations()
  const municipalities = useData((s) => s.municipalities)
  const settingsList = useData((s) => s.settingsList)
  const payments = useData((s) => s.payments)
  const statusOf = usePaymentStatus()
  const approval = useApproval()
  const correction = useCorrectionApplication()
  const allNonFilers = useNonFilers()
  // Nada sale hasta consultar un rango de fechas: de presentación en las presentadas, de vencimiento en los omisos.
  const { query, consult } = useDateQuery('declarations')
  const nonFilers = useMemo(
    () => ({
      ...allNonFilers,
      nonFilers: query
        ? allNonFilers.nonFilers.filter((o) => inDateRange(o.dueDateItem, query))
        : [],
    }),
    [allNonFilers, query],
  )
  // La vista va en la dirección (?vista=omisos) para que Inicio pueda enlazar directo a los omisos.
  const [params, setParams] = useSearchParams()
  const withRitVisible = ritVisible(municipalities, municipalityId)
  const view: DeclarationsView =
    withRitVisible && params.get('vista') === 'omisos' ? 'nonFilers' : 'filed'
  const [tab, setTax] = useState<FilterValue<Tax>>('')
  const visible = visibleTaxes(municipalities, municipalityId)
  const tabs = TABS.filter((p) => !p.value || visible.includes(p.value))
  // Si 1cero1 desactiva el impuesto de la pestaña elegida, se vuelve a "Todas".
  const tax = tab && visible.includes(tab) ? tab : ''
  const [text, setText] = useState('')
  const [kind, setKind] = useState<FilterValue<DeclarationKind>>('')
  const [payment, setPayment] = useState<FilterValue<PaymentStatus>>('')
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>('')
  const [noCalendarOnly, setNoCalendarOnly] = useState(false)
  const [unregisteredOnly, setUnregisteredOnly] = useState(false)
  // El filtro de correcciones a la baja puede venir en la dirección (?correccion=por_resolver), desde Inicio.
  const [correctionFilter, setCorrectionFilter] = useState<CorrectionFilter>(() => {
    const value = params.get('correccion')
    return (value && CORRECTION_URL_VALUES[value]) || ''
  })

  const rows = useMemo<DeclarationRow[]>(() => {
    if (!query) return []
    // La que se corrige puede haberse presentado antes del rango: se busca entre todas.
    const byId = new Map(declarations.map((d) => [d.id, d]))
    const configByMunicipality = new Map(settingsList.map((c) => [c.municipalityId, c]))
    const inRit = withRit(municipalities)
    const inRange = declarations.filter((d) => inDateRange(d.filingDate, query))
    const outside = replaced(declarations, correction)
    return inRange.map((d) => {
      const corrected = d.correctsId ? byId.get(d.correctsId) : undefined
      const situation = correction(d)
      return {
        d,
        name: d.taxpayer.name,
        document: documentFormat(d.taxpayer),
        // La solicitud de corrección que no se ha aceptado no se paga: su estado de pago no aplica.
        payment: currentCorrection(situation) ? statusOf(d) : undefined,
        paidAmount: totalPaid(d.id, payments),
        isReplaced: outside.has(d.id),
        corrects: corrected?.number,
        downward: isDownwardCorrection(d, corrected),
        correction: situation,
        approval: approval(d),
        withoutCalendar: filedWithoutCalendar(d, configByMunicipality.get(d.municipalityId)),
        unregistered: inRit(d) && !d.registrationId,
      }
    })
  }, [declarations, municipalities, settingsList, payments, statusOf, approval, correction, query])

  // Columna y filtro de aprobación solo si hay declaraciones con aprobación previa; si no, el filtro elegido no aplica.
  const withApproval = rows.some((f) => f.approval)
  const approvalStatus = withApproval ? approvalFilter : ''
  // El filtro solo sale si hay declaraciones presentadas sin el calendario cargado; si no, el elegido no aplica.
  const withNoCalendar = rows.some((f) => f.withoutCalendar)
  const filterNoCalendar = withNoCalendar && noCalendarOnly
  // Lo mismo con las de quien no está inscrito en el RIT, que solo hay donde un formulario no se valida contra el RIT.
  const withUnregistered = rows.some((f) => f.unregistered)
  const filterUnregistered = withUnregistered && unregisteredOnly
  // Y el de las correcciones a la baja: solo si hay alguna.
  const withDownward = rows.some((f) => f.downward)
  const correctionStatus = withDownward ? correctionFilter : ''

  const filteredItems = useMemo(() => {
    const query = text.trim().toLowerCase()
    // Todas las correcciones a la baja, las directas (sin solicitud) o las solicitudes en un estado.
    const correctionPasses = (downward: boolean, c: DeclarationRow['correction']) =>
      !correctionStatus ||
      (downward &&
        (correctionStatus === 'all' ||
          (correctionStatus === 'direct' ? !c : c?.status === correctionStatus)))
    return rows.filter(
      ({
        d,
        name,
        document,
        payment: p,
        approval: a,
        withoutCalendar,
        unregistered,
        downward,
        correction: c,
      }) =>
        correctionPasses(downward, c) &&
        (!tax || d.tax === tax) &&
        (!query ||
          name.toLowerCase().includes(query) ||
          document.toLowerCase().includes(query) ||
          d.number.toLowerCase().includes(query) ||
          String(d.invoiceNumber).includes(query)) &&
        (!kind || d.kind === kind) &&
        (!payment || p === payment) &&
        (!approvalStatus || (a?.status ?? 'not_applicable') === approvalStatus) &&
        (!filterNoCalendar || withoutCalendar) &&
        (!filterUnregistered || unregistered),
    )
  }, [
    rows,
    tax,
    text,
    kind,
    payment,
    approvalStatus,
    filterNoCalendar,
    filterUnregistered,
    correctionStatus,
  ])

  // La selección sobrevive a los filtros, pero solo cuentan y se descargan las declaraciones que siguen visibles.
  const [selection, setSelection] = useState<ReadonlySet<string>>(new Set())
  const mark = useCallback(
    (ids: string[], isChecked: boolean) => {
      setSelection((current) => {
        const newItem = new Set(current)
        for (const id of ids) {
          if (isChecked) newItem.add(id)
          else newItem.delete(id)
        }
        return newItem
      })
    },
    [setSelection],
  )
  const checkedOnes = filteredItems.filter((f) => selection.has(f.d.id))

  return (
    <>
      <PageHeader
        title="Declaraciones"
        description="ICA anual (formulario único nacional), retención (ReteICA) y autorretención (AutoReteICA). Las de ReteICA y AutoReteICA sin pago total son ineficaces."
      />
      <DateQueryBar
        query={query}
        consult={consult}
        criterion={view === 'nonFilers' ? CRITERION.nonFilers : CRITERION.filed}
      >
        {canSeeAll && <MunicipalitySearch inline />}
      </DateQueryBar>

      {/* Vista e impuesto solo salen después de consultar: antes no hay qué separar ni contar. */}
      {query && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
          {withRitVisible && (
            <SegmentedControl
              label="Vista"
              className="sm:inline-flex"
              options={VIEWS.map((v) => ({
                ...v,
                count: v.value === 'nonFilers' ? nonFilers.nonFilers.length : rows.length,
              }))}
              value={view}
              change={(v) =>
                setParams(v === 'nonFilers' ? { vista: 'omisos' } : {}, { replace: true })
              }
            />
          )}
          <SegmentedControl
            label="Impuesto"
            className="sm:inline-flex"
            options={tabs.map((p) => ({
              ...p,
              count:
                view === 'nonFilers'
                  ? nonFilers.nonFilers.filter((o) => !p.value || o.tax === p.value).length
                  : rows.filter((f) => !p.value || f.d.tax === p.value).length,
            }))}
            value={tax}
            change={setTax}
          />
          {/* Solo aplican a las presentadas, y cada uno sale si hay alguna declaración que lo cumpla. */}
          {view === 'filed' && (
            <ToggleGroup
              label="Mostrar solo"
              className="sm:inline-flex"
              options={[
                ...(withNoCalendar
                  ? [
                      {
                        text: 'Sin calendario',
                        title: 'Solo las presentadas sin el calendario cargado',
                        isActive: noCalendarOnly,
                        change: setNoCalendarOnly,
                      },
                    ]
                  : []),
                ...(withUnregistered
                  ? [
                      {
                        text: 'No inscritos',
                        title: 'Solo las de contribuyentes no inscritos en el RIT',
                        isActive: unregisteredOnly,
                        change: setUnregisteredOnly,
                      },
                    ]
                  : []),
              ]}
            />
          )}
        </div>
      )}

      {!query ? (
        <Card>
          <EmptyState
            title={NO_QUERY.title}
            description={view === 'nonFilers' ? NO_QUERY.nonFilers : NO_QUERY.filed}
          />
        </Card>
      ) : view === 'nonFilers' ? (
        <NonFilerList result={nonFilers} tax={tax} />
      ) : (
        <Card>
          <FilterBar
            searchBox={
              <SearchBox
                placeholder="Buscar por contribuyente, NIT o cédula, radicado o factura"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            }
            actions={<DeclarationsDownload declarations={checkedOnes.map((f) => f.d)} />}
          >
            <Filter
              label="Tipo de declaración"
              options={TYPE_OPTIONS}
              value={kind}
              change={setKind}
            />
            <Filter
              label="Estado de pago"
              options={PAYMENT_OPTIONS}
              value={payment}
              change={setPayment}
            />
            {withApproval && (
              <Filter
                label="Aprobación"
                options={APPROVAL_OPTIONS}
                value={approvalStatus}
                change={setApprovalFilter}
              />
            )}
            {withDownward && (
              <Filter
                label="Corrección a la baja"
                options={CORRECTION_OPTIONS}
                value={correctionStatus}
                change={setCorrectionFilter}
              />
            )}
          </FilterBar>

          <DeclarationsTable
            rows={filteredItems}
            selection={selection}
            mark={mark}
            withApproval={withApproval}
          />
        </Card>
      )}
    </>
  )
}
