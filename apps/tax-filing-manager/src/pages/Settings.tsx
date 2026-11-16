import { PickMunicipality, PageHeader } from '../components/molecules'
import { MunicipalitySearch, SettingsForm } from '../components/organisms'
import { can, useSession } from '../lib'
import { useData } from '../store'

export default function Settings() {
  const { user, municipalityId } = useSession()
  const settingsList = useData((s) => s.settingsList)
  const municipalities = useData((s) => s.municipalities)
  const config = settingsList.find((c) => c.municipalityId === municipalityId)
  const editable = can(user?.role, 'editSettings')

  return (
    <>
      <PageHeader
        title="Configuración del municipio"
        description={
          config
            ? `${municipalities.find((m) => m.id === municipalityId)?.name}. ${editable ? '' : 'Solo lectura: la configuración la cambia el administrador del municipio.'}`
            : undefined
        }
      />
      <MunicipalitySearch all={false} />
      {config ? (
        <SettingsForm key={config.municipalityId} config={config} editable={editable} />
      ) : (
        <PickMunicipality description="Búscalo arriba por su nombre para ver y cambiar su configuración." />
      )}
    </>
  )
}
