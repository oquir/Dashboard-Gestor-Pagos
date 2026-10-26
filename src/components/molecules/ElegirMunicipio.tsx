import { Card } from '../atoms'
import Vacio from './Vacio'

/** Lo que muestra una página que necesita un municipio cuando 1cero1 está viendo todos. */
export default function ElegirMunicipio({ descripcion }: { descripcion: string }) {
  return (
    <Card>
      <Vacio titulo="Elige un municipio" descripcion={descripcion} />
    </Card>
  )
}
