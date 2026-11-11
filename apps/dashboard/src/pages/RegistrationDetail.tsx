import { useState } from 'react'
import { useParams } from 'react-router'
import { Badge, Card } from '../components/atoms'
import { EmptyState } from '../components/molecules'
import {
  MissingDeclarations,
  FiledDeclarations,
  ApplicationHeader,
  CancellationCard,
  RitCard,
  ApplicationsTimeline,
  FileList,
  ApplicationReply,
} from '../components/organisms'
import { TemplateDetail } from '../components/templates'
import {
  RIT_CHANGE_FILE_NAMES,
  registrationStatusLabel,
  can,
  activitiesOf,
  lateRegistrationDays,
  withRit,
  activeTax,
  useSession,
  registrationTone,
} from '../lib'
import { useData } from '../store'

export default function RegistrationDetail() {
  const { id } = useParams()
  const { user } = useSession()
  const registration = useData((s) => s.registrations.find((i) => i.id === id))
  const allDeclarations = useData((s) => s.declarations)
  const settingsList = useData((s) => s.settingsList)
  const activityUploads = useData((s) => s.activities)
  const municipalities = useData((s) => s.municipalities)
  /** Solicitud cuyo formulario se está viendo; null = los datos actuales. */
  const [selection, setSelection] = useState<string | null>(null)

  if (
    !registration ||
    (user?.municipalityId && registration.municipalityId !== user.municipalityId)
  ) {
    return (
      <EmptyState
        title="No se encontró la inscripción"
        description="Puede que no exista o que sea de otro municipio."
      />
    )
  }
  if (!withRit(municipalities)(registration)) {
    return (
      <EmptyState
        title="El RIT no está en el aplicativo para este municipio"
        description="1cero1 lo puede activar en Municipios."
      />
    )
  }

  const config = settingsList.find((c) => c.municipalityId === registration.municipalityId)
  const rates =
    activitiesOf(activityUploads, registration.municipalityId, new Date().getFullYear())?.rates ??
    []
  const declarations = allDeclarations
    .filter((d) => d.registrationId === registration.id)
    .filter(activeTax(municipalities))
    .sort((a, b) => b.filingDate.localeCompare(a.filingDate))
  const canReview = can(user?.role, 'review')
  const application = registration.ritChanges.find((n) => n.id === selection)
  // Se compara con la última solicitud aprobada antes de la elegida.
  const previous =
    application &&
    registration.ritChanges
      .slice(0, registration.ritChanges.indexOf(application))
      .findLast((n) => n.status === 'approved' && n.data)?.data
  const municipality = municipalities.find((m) => m.id === registration.municipalityId)
  // La inscripción se juzga con los datos que radicó, aunque luego los haya actualizado.
  const lodged = registration.ritChanges.find((n) => n.kind === 'registration')
  const ritSince = municipality?.inProductionSince.rit
  const lateItem =
    lodged?.data && config && ritSince
      ? lateRegistrationDays(
          lodged.data.activitiesStartDate,
          lodged.date,
          config.registrationTermMonths,
          ritSince,
        )
      : null
  const supports = application ? application.supports : registration.supports
  const pick = (ritChangeId: string | null) => {
    setSelection(ritChangeId)
    // En pantallas angostas la ficha queda arriba de la línea de tiempo.
    const card = document.getElementById('ficha')
    if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <TemplateDetail
      goBack={{ a: '/rit', text: 'Inscripciones RIT' }}
      title={registration.name}
      description={`RIT ${registration.ritNumber} · ${municipality?.name}`}
      actions={
        <div className="flex flex-wrap gap-2">
          {lateItem && <Badge tone="alert">Inscripción tardía</Badge>}
          <Badge tone={registrationTone[registration.status]}>
            {registrationStatusLabel[registration.status]}
          </Badge>
        </div>
      }
      mainId="ficha"
      main={
        <>
          {application && (
            <ApplicationHeader
              application={application}
              compared={Boolean(previous)}
              showCurrent={() => pick(null)}
              lateItem={application === lodged ? lateItem : null}
            />
          )}
          {application?.cancellation ? (
            <CancellationCard registration={registration} cancellation={application.cancellation} />
          ) : (
            <RitCard
              data={application?.data ?? registration}
              previous={previous}
              rates={application ? undefined : rates}
            />
          )}
          {(registration.status === 'active' || registration.status === 'cancelled') && (
            <MissingDeclarations registration={registration} />
          )}
          <FiledDeclarations declarations={declarations} simpleRegime={registration.simpleRegime} />
        </>
      }
      side={
        <>
          <ApplicationsTimeline
            registration={registration}
            application={application}
            pick={pick}
            config={config}
            canReview={canReview}
          />
          <Card>
            <FileList
              title={application ? 'Soportes de la solicitud' : 'Soportes'}
              description={
                supports.length > 0
                  ? `${supports.filter((s) => s.file).length} de ${supports.length} cargados`
                  : undefined
              }
              items={supports.map((s) => ({ title: s.name, file: s.file }))}
              context={[`Contribuyente: ${registration.name}`, `RIT: ${registration.ritNumber}`]}
              zipName={`soportes_RIT_${registration.ritNumber}${application ? `_${RIT_CHANGE_FILE_NAMES[application.kind]}_${application.date}` : ''}.zip`}
              empty="El contribuyente no cargó documentos con esta solicitud."
            />
          </Card>
          {canReview &&
            registration.ritChanges
              .filter((n) => n.status === 'pending')
              .map((n) => (
                <ApplicationReply
                  key={n.id}
                  registrationId={registration.id}
                  ritChange={n}
                  email={registration.email}
                />
              ))}
        </>
      }
    />
  )
}
