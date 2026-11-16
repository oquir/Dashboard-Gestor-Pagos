import { useMemo } from 'react'
import { Navigate } from 'react-router'
import { PickMunicipality, PageHeader } from '../components/molecules'
import {
  MunicipalitySearch,
  MunicipalityHeader,
  MunicipalityForms,
  MunicipalityModules,
} from '../components/organisms'
import { can, activeTax, useSession } from '../lib'
import { useData } from '../store'
import type { MunicipalityFigures } from '../types'

export default function Municipalities() {
  const { user, municipalityId } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const registrations = useData((s) => s.registrations)
  const declarations = useData((s) => s.declarations)
  const payments = useData((s) => s.payments)
  const users = useData((s) => s.users)
  const settingsList = useData((s) => s.settingsList)
  // El que 1cero1 eligió en el buscador.
  const m = municipalities.find((x) => x.id === municipalityId)

  const figures = useMemo<MunicipalityFigures | null>(() => {
    if (!municipalityId) return null
    const theirOnes = declarations
      .filter(activeTax(municipalities))
      .filter((d) => d.municipalityId === municipalityId)
    const ids = new Set(theirOnes.map((d) => d.id))
    return {
      activeItems: registrations.filter(
        (i) => i.municipalityId === municipalityId && i.status === 'active',
      ).length,
      declarations: theirOnes.length,
      collection: payments
        .filter((p) => ids.has(p.declarationId) && p.date.startsWith('2026'))
        .reduce((s, p) => s + p.value, 0),
      users: users.filter((u) => u.municipalityId === municipalityId && u.isActive).length,
    }
  }, [municipalityId, municipalities, registrations, declarations, payments, users])

  if (!can(user?.role, 'manageMunicipalities')) return <Navigate to="/" replace />

  const pausas = settingsList.find((c) => c.municipalityId === municipalityId)?.disabledForms ?? {}

  return (
    <>
      <PageHeader
        title="Municipios"
        description="Los municipios que usan el aplicativo. Busca uno por su nombre para ver sus cifras y activar lo que gestiona. Desactivar un municipio le quita el acceso a sus usuarios."
      />
      <MunicipalitySearch all={false} />
      <div className="space-y-6">
        {m && figures ? (
          <>
            <MunicipalityHeader municipality={m} figures={figures} />
            <MunicipalityModules municipality={m} pausas={pausas} />
            <MunicipalityForms municipality={m} pausas={pausas} />
          </>
        ) : (
          <PickMunicipality description="Búscalo por su nombre para ver sus cifras y activar lo que gestiona." />
        )}
      </div>
    </>
  )
}
