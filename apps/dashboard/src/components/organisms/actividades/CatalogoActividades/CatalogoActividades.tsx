import { useState } from 'react'
import { puede } from '../../../../lib/permisos'
import { actividadesDe } from '../../../../lib/reglas'
import { useSesion } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import type { VistaPrevia } from '../../../../types'
import CargaActividades from '../CargaActividades'
import TablaActividades from '../TablaActividades'
import type { CatalogoActividadesProps } from './types'

/** Actividades de un año gravable del municipio: la carga desde Excel (si el rol puede) y el listado. */
export default function CatalogoActividades({ municipioId, vigencia }: CatalogoActividadesProps) {
  const { usuario } = useSesion()
  const cargas = useDatos((s) => s.actividades)
  const puedeCargar = puede(usuario?.rol, 'cargarActividades')
  const [vista, setVista] = useState<VistaPrevia | null>(null)

  const delMunicipio = cargas.filter((c) => c.municipioId === municipioId)
  const actual = delMunicipio.find((c) => c.vigencia === vigencia)
  // La plantilla de un año sin cargar trae las del año anterior, para no empezar de cero.
  const base = actividadesDe(cargas, municipioId, vigencia) ?? delMunicipio.toSorted((a, b) => b.vigencia - a.vigencia)[0]

  return (
    <div className="space-y-6">
      {puedeCargar && <CargaActividades municipioId={municipioId} vigencia={vigencia} base={base} actual={actual} vista={vista} cambiarVista={setVista} />}
      <TablaActividades vigencia={vigencia} actual={actual} vista={vista} puedeCargar={puedeCargar} />
    </div>
  )
}
