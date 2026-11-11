import { ElegirMunicipio, PageHeader } from '../components/molecules'
import { BuscadorMunicipios, FormularioCalendario } from '../components/organisms'
import { puede } from '../lib'
import { useSesion } from '../lib'
import { useDatos } from '../store'

export default function Calendario() {
  const { usuario, municipioId } = useSesion()
  const configuraciones = useDatos((s) => s.configuraciones)
  const config = configuraciones.find((c) => c.municipioId === municipioId)
  const editable = puede(usuario?.rol, 'editarConfiguracion')

  return (
    <>
      <PageHeader
        titulo="Calendario tributario"
        descripcion={`Vencimientos y descuentos por pronto pago de cada año gravable.${editable ? '' : ' Solo lectura: los cambia el administrador del municipio.'}`}
      />
      <BuscadorMunicipios todos={false} />
      {config ? (
        <FormularioCalendario key={config.municipioId} config={config} editable={editable} />
      ) : (
        <ElegirMunicipio descripcion="Búscalo arriba por su nombre para ver y cambiar su calendario." />
      )}
    </>
  )
}
