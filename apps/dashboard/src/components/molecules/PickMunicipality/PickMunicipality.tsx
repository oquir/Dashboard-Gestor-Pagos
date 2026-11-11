import { Card } from '../../atoms'
import EmptyState from '../EmptyState'
import type { PickMunicipalityProps } from './PickMunicipality.types'

/** Lo que muestra una página que necesita un municipio cuando 1cero1 está viendo todos. */
export default function PickMunicipality({ description }: PickMunicipalityProps) {
  return (
    <Card>
      <EmptyState title="Elige un municipio" description={description} />
    </Card>
  )
}
