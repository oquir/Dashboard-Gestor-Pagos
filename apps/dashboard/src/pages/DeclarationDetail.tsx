import { Link, useParams } from 'react-router'
import { Badge, Card } from '../components/atoms'
import { Notice, EmptyState } from '../components/molecules'
import {
  PriorApproval,
  NoCalendarNotice,
  UnremittedNotice,
  DeclarationTaxpayer,
  DeclarationData,
  DeclarationSummonses,
  DeclarationSignatures,
  Calculation,
  FileList,
  DeclarationPayments,
  TellerPayment,
  CorrectionApplication,
  DeclarationValidations,
} from '../components/organisms'
import { TemplateDetail } from '../components/templates'
import {
  calendarUpload,
  filedWithoutCalendar,
  previousSummons,
  correctionStatusLabel,
  paymentStatusLabel,
  taxLabel,
  periodLabel,
  formatDate,
  formatPesos,
  declarationTypeText,
  can,
  correctionToResolve,
  currentCorrection,
  isDownwardCorrection,
  overpayment,
  canBePaid,
  totalInClearing,
  totalPaid,
  withRit,
  activeTax,
  isValidatedAgainstRit,
  useApproval,
  usePaymentStatus,
  useSession,
  useUnremitted,
  useCorrectionApplication,
  tellerOf,
  correctionTone,
  paymentTone,
} from '../lib'
import { useData } from '../store'

export default function DeclarationDetail() {
  const { id } = useParams()
  const { user } = useSession()
  const declarations = useData((s) => s.declarations)
  const registrations = useData((s) => s.registrations)
  const payments = useData((s) => s.payments)
  const checks = useData((s) => s.checks)
  const municipalities = useData((s) => s.municipalities)
  const settingsList = useData((s) => s.settingsList)
  const summonses = useData((s) => s.summonses)
  const approval = useApproval()
  const correction = useCorrectionApplication()
  const statusOf = usePaymentStatus()
  // De todas las declaraciones: 1cero1 puede abrir una de un municipio distinto del que eligió en el buscador.
  const unremitted = useUnremitted(declarations)
  const d = declarations.find((x) => x.id === id)

  if (!d || (user?.municipalityId && d.municipalityId !== user.municipalityId)) {
    return (
      <EmptyState
        title="No se encontró la declaración"
        description="Puede que no exista o que sea de otro municipio."
      />
    )
  }
  if (!activeTax(municipalities)(d)) {
    return (
      <EmptyState
        title={`${taxLabel[d.tax]} no está activo en este municipio`}
        description="1cero1 lo puede activar en Municipios."
      />
    )
  }

  const reg = registrations.find((i) => i.id === d.registrationId)
  const status = statusOf(d)
  const withholding = unremitted.find((r) => r.d.id === d.id)
  const corrected = d.correctsId ? declarations.find((x) => x.id === d.correctsId) : undefined
  // La solicitud de corrección que no se ha aceptado no la reemplaza: esta sigue vigente.
  const replacement = declarations.find(
    (x) => x.correctsId === d.id && currentCorrection(correction(x)),
  )
  // La que espera respuesta: si el municipio no la resuelve a tiempo, se acepta sola y la reemplaza.
  const toResolve = declarations.find(
    (x) => x.correctsId === d.id && correctionToResolve(correction(x)),
  )
  const limitToResolve = toResolve && correction(toResolve)?.limit
  const application = correction(d)
  // Mientras no se acepte, la solicitud no se paga: su estado de pago no aplica.
  const inForce = currentCorrection(application)
  const downward = isDownwardCorrection(d, corrected)
  const excess = inForce ? overpayment(d) : 0
  const municipalityWithRit = withRit(municipalities)(d)
  // Su ficha del RIT: solo si el municipio tiene el RIT en el aplicativo y el contribuyente está inscrito.
  const inRit = municipalityWithRit ? reg : undefined
  const situation = approval(d)
  const municipality = municipalities.find((m) => m.id === d.municipalityId)
  // Efectivo y cheque se activan por formulario: solo se ofrece lo que tiene el de esta declaración.
  const teller = tellerOf(municipality, d.tax)
  const cfg = settingsList.find((c) => c.municipalityId === d.municipalityId)
  const partialCheck = cfg?.partialCheck ?? false
  const withoutCalendar = filedWithoutCalendar(d, cfg)
  // Lo que está en canje no se vuelve a cobrar mientras el banco responde.
  const balance = Math.max(
    d.totalToPay - totalPaid(d.id, payments) - totalInClearing(d.id, checks),
    0,
  )
  // En ventanilla solo se recibe lo que ya es deuda: ni lo reemplazado por una corrección, ni lo que espera aprobación,
  // ni la solicitud de corrección que no se ha aceptado.
  // Solo se emplaza para corregir la declaración vigente: ni la reemplazada, ni la solicitud sin aceptar, ni la rechazada
  // en la aprobación previa, que se tiene por no presentada.
  const summonable = !replacement && inForce && situation?.status !== 'rejected'
  const acceptsTeller =
    (teller.cash || teller.check) &&
    can(user?.role, 'recordTellerPayment') &&
    !replacement &&
    canBePaid(situation) &&
    currentCorrection(application)

  return (
    <TemplateDetail
      goBack={{ a: '/declaraciones', text: 'Declaraciones' }}
      title={`${taxLabel[d.tax]} · ${periodLabel(d)}`}
      description={`Radicado ${d.number}`}
      actions={
        <>
          <Badge tone="info">{declarationTypeText(d.kind, downward)}</Badge>
          {application && !inForce ? (
            <Badge tone={correctionTone[application.status]}>
              Solicitud {correctionStatusLabel[application.status].toLowerCase()}
            </Badge>
          ) : (
            <Badge tone={paymentTone[status]}>{paymentStatusLabel[status]}</Badge>
          )}
        </>
      }
      notice={
        (replacement || toResolve || !inForce || excess > 0 || withholding || withoutCalendar) && (
          <div className="space-y-3">
            {replacement ? (
              <Notice tone="info">
                Esta declaración fue reemplazada por la corrección{' '}
                <Link className="font-medium underline" to={`/declaraciones/${replacement.id}`}>
                  {replacement.number}
                </Link>
                .
              </Notice>
            ) : (
              <>
                {toResolve && limitToResolve && (
                  <Notice tone="alert">
                    Tiene una solicitud de corrección a la baja por resolver, la{' '}
                    <Link className="font-medium underline" to={`/declaraciones/${toResolve.id}`}>
                      {toResolve.number}
                    </Link>
                    . Si el municipio no la resuelve antes del {formatDate(limitToResolve)}, se
                    acepta sola y reemplaza a esta declaración.
                  </Notice>
                )}
                {withholding && <UnremittedNotice r={withholding} />}
              </>
            )}
            {!inForce && corrected && (
              <Notice tone={application?.status === 'rejected' ? 'danger' : 'info'}>
                {application?.status === 'rejected'
                  ? 'Se rechazó esta solicitud de corrección a la baja: sigue vigente la declaración '
                  : 'Es una solicitud de corrección a la baja: mientras el municipio no la acepte, no se paga y sigue vigente la declaración '}
                <Link className="font-medium underline" to={`/declaraciones/${corrected.id}`}>
                  {corrected.number}
                </Link>
                .
              </Notice>
            )}
            {excess > 0 && corrected && (
              <Notice tone="info">
                Con la declaración que corrige, la {corrected.number}, se pagaron{' '}
                {formatPesos(excess)} más de lo que liquida esta corrección. Es un pago en exceso:
                el contribuyente lo puede pedir al municipio en devolución o compensación.
              </Notice>
            )}
            {withoutCalendar && (
              <NoCalendarNotice d={d} upload={calendarUpload(cfg, d.fiscalYear)} />
            )}
          </div>
        )
      }
      main={
        <>
          {/* Sin ficha del RIT, lo que dice la declaración es todo lo que se sabe del contribuyente: va arriba de la liquidación. */}
          {!inRit && (
            <DeclarationTaxpayer
              d={d}
              unregistered={municipalityWithRit && !d.registrationId}
              wide
            />
          )}
          <Calculation d={d} />
          {inForce && <DeclarationPayments d={d} payments={payments} checks={checks} />}
          {acceptsTeller && (
            <TellerPayment
              key={d.id}
              d={d}
              balance={balance}
              methods={teller}
              partialCheck={partialCheck}
            />
          )}
        </>
      }
      side={
        <>
          {application && (
            <CorrectionApplication
              d={d}
              corrected={corrected}
              situation={application}
              email={d.taxpayer.email}
              canResolve={can(user?.role, 'review')}
            />
          )}
          {situation && (
            <PriorApproval
              d={d}
              situation={situation}
              email={d.taxpayer.email}
              canResolve={can(user?.role, 'review')}
              teller={teller}
            />
          )}
          <DeclarationData d={d} corrected={corrected} downward={downward} />
          <DeclarationSummonses d={d} canRecord={can(user?.role, 'review') && summonable} />
          {inRit && <DeclarationTaxpayer d={d} reg={inRit} />}
          <DeclarationSignatures d={d} />
          <Card>
            <FileList
              title="Archivos adjuntos"
              description="Anexos que el contribuyente cargó con la declaración."
              items={d.attachments.map((a) => ({ title: a.name, file: a.file }))}
              context={[`Declaración ${d.number}`, `Contribuyente: ${d.taxpayer.name}`]}
              zipName={`adjuntos_${d.number}.zip`}
              empty="No cargó archivos."
            />
          </Card>
          <DeclarationValidations
            d={d}
            reg={reg}
            againstRit={isValidatedAgainstRit(municipalities, d)}
            municipalityWithRit={municipalityWithRit}
            corrected={corrected}
            penalty={{
              summons: previousSummons(d, declarations, summonses),
              penalties: cfg?.penalties,
            }}
          />
        </>
      }
    />
  )
}
