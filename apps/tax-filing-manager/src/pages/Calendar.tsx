import { PickMunicipality, PageHeader } from '../components/molecules'
import { MunicipalitySearch, CalendarForm } from '../components/organisms'
import { can, useSession } from '../lib'
import { useData } from '../store'

export default function Calendar() {
  const { user, municipalityId } = useSession()
  const settingsList = useData((s) => s.settingsList)
  const config = settingsList.find((c) => c.municipalityId === municipalityId)
  const editable = can(user?.role, 'editSettings')

  return (
    <>
      <PageHeader
        title="Calendario tributario"
        description={`Vencimientos y descuentos por pronto pago de cada año gravable.${editable ? '' : ' Solo lectura: los cambia el administrador del municipio.'}`}
      />
      <MunicipalitySearch all={false} />
      {config ? (
        <CalendarForm key={config.municipalityId} config={config} editable={editable} />
      ) : (
        <PickMunicipality description="Búscalo arriba por su nombre para ver y cambiar su calendario." />
      )}
    </>
  )
}
