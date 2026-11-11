import { useMemo, useState } from 'react'
import { Navigate } from 'react-router'
import { Field, Filter, PageHeader, DateRange, SegmentedControl } from '../components/molecules'
import { MunicipalitySearch, BarChart, ReportTable } from '../components/organisms'
import { APPROVAL_OPTIONS } from '../constants'
import {
  can,
  buildReports,
  REPORTS,
  ritVisible,
  useApproval,
  useDeclarations,
  usePaymentStatus,
  useSession,
  useCorrectionApplication,
} from '../lib'
import type { ReportId } from '../lib'
import { useData } from '../store'
import type { ApprovalFilter } from '../types'
import { today } from '../utils'

export default function Reports() {
  const { user, municipalityId } = useSession()
  const declarations = useDeclarations()
  const registrations = useData((s) => s.registrations)
  const payments = useData((s) => s.payments)
  const municipalities = useData((s) => s.municipalities)
  const approval = useApproval()
  const correction = useCorrectionApplication()
  const statusOf = usePaymentStatus()
  const [tab, setTab] = useState<ReportId>('declarations')
  const [from, setFrom] = useState(`${today().slice(0, 4)}-01-01`)
  const [to, setTo] = useState(today)
  const invalidRange = !from || !to || from > to
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>('')
  // Columna y filtro de aprobación solo si hay declaraciones con aprobación previa; si no, el filtro elegido no aplica.
  const withApproval = declarations.some((d) => d.approval)
  const approvalStatus = withApproval ? approvalFilter : ''

  // El RIT solo existe donde el municipio lo tiene en el aplicativo.
  const withRitVisible = ritVisible(municipalities, municipalityId)
  const reports = REPORTS.filter((r) => r.id !== 'rit' || withRitVisible)
  const report = reports.find((r) => r.id === tab) ?? reports[0]

  const data = useMemo(
    () =>
      buildReports({
        declarations,
        registrations,
        payments,
        municipalities,
        municipalityId,
        from,
        to,
        invalidRange,
        approval,
        correction,
        statusOf,
        approvalStatus,
      }),
    [
      declarations,
      registrations,
      payments,
      municipalities,
      municipalityId,
      from,
      to,
      invalidRange,
      approval,
      correction,
      statusOf,
      approvalStatus,
    ],
  )

  if (!can(user?.role, 'canSeeReports')) return <Navigate to="/" replace />

  const { rows, charts } = data[report.id]

  return (
    <>
      <PageHeader
        title="Reportes"
        description="Gráficas e informes del municipio. Consulta los datos en la tabla y descárgalos en Excel."
      />
      <MunicipalitySearch />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SegmentedControl
          label="Reporte"
          className="sm:inline-flex"
          options={reports.map((r) => ({
            value: r.id,
            text: r.tab,
            count: data[r.id].rows.length,
          }))}
          value={report.id}
          change={setTab}
        />

        {report.byDates ? (
          <div className="flex flex-wrap items-start gap-3">
            <DateRange from={from} to={to} changeFrom={setFrom} changeTo={setTo} />
            {report.id === 'declarations' && withApproval && (
              <Field label="Aprobación">
                <Filter
                  label="Aprobación"
                  options={APPROVAL_OPTIONS}
                  value={approvalStatus}
                  change={setApprovalFilter}
                />
              </Field>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Datos al día de hoy.</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {charts.map((g) => (
          <BarChart
            key={g.title}
            title={g.title}
            description={g.description}
            format={g.format}
            bars={g.bars}
          />
        ))}
      </div>

      <div className="mt-6">
        <ReportTable
          key={report.id}
          report={report}
          rows={rows}
          withoutApproval={report.id === 'declarations' && !withApproval}
          from={from}
          to={to}
          invalidRange={invalidRange}
        />
      </div>
    </>
  )
}
