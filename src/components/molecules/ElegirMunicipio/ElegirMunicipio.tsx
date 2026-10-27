import { Card } from '../../atoms'
import Vacio from '../Vacio'
import type { ElegirMunicipioProps } from './types'

/** Lo que muestra una página que necesita un municipio cuando 1cero1 está viendo todos. */
export default function ElegirMunicipio({ descripcion }: ElegirMunicipioProps) {
  return (
    <Card>
      <Vacio titulo="Elige un municipio" descripcion={descripcion} />
    </Card>
  )
}
