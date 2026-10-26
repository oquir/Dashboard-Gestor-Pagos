import { ElegirMunicipio, PageHeader } from '../components/molecules'
import { FormularioConfiguracion } from '../components/organisms'
import { puede } from '../lib/permisos'
import { useSesion } from '../lib/sesion'
import { useDatos } from '../store'

export default function Configuracion() {
  const { usuario, municipioId } = useSesion()
  const configuraciones = useDatos((s) => s.configuraciones)
  const municipios = useDatos((s) => s.municipios)
  const config = configuraciones.find((c) => c.municipioId === municipioId)
  const editable = puede(usuario?.rol, 'editarConfiguracion')

  return (
    <>
      <PageHeader
        titulo="Configuración del municipio"
        descripcion={
          config
            ? `${municipios.find((m) => m.id === municipioId)?.nombre}. ${editable ? '' : 'Solo lectura: la configuración la cambia el administrador del municipio.'}`
            : undefined
        }
      />
      {config ? (
        <FormularioConfiguracion key={config.municipioId} config={config} editable={editable} />
      ) : (
        <ElegirMunicipio descripcion="Selecciona en la barra superior el municipio que quieres configurar." />
      )}
    </>
  )
}
