import { useMemo, useState } from 'react'
import { Navigate } from 'react-router'
import { Card } from '../../components/atoms'
import {
  FilterBar,
  SearchBox,
  Filter,
  CheckboxFilter,
  SelectableIndicator,
  PageHeader,
} from '../../components/molecules'
import { MunicipalitySearch, RegistrationsTable } from '../../components/organisms'
import { lastProcedure, withRit, ofMunicipality, ritVisible, useSession } from '../../lib'
import { useData } from '../../store'
import type {
  Capacity,
  RegistrationStatus,
  RitChangeKind,
  PersonType,
  FilterValue,
} from '../../types'
import {
  CAPACITIES,
  CAPACITY_OPTIONS,
  STATUS_OPTIONS,
  PERSON_TYPE_OPTIONS,
  PROCEDURE_OPTIONS,
  PLURAL,
} from './Registrations.constants'

export default function Registrations() {
  const { municipalityId } = useSession()
  const allItems = useData((s) => s.registrations)
  const municipalities = useData((s) => s.municipalities)
  const [text, setText] = useState('')
  const [personType, setPersonType] = useState<FilterValue<PersonType>>('')
  const [capacity, setCapacity] = useState<FilterValue<Capacity>>('')
  const [status, setStatus] = useState<FilterValue<RegistrationStatus>>('')
  const [procedure, setProcedure] = useState<FilterValue<RitChangeKind>>('')
  const [pendingOnly, setPendingOnly] = useState(false)

  const registrations = useMemo(
    () => ofMunicipality(allItems, municipalityId).filter(withRit(municipalities)),
    [allItems, municipalities, municipalityId],
  )

  const filteredItems = useMemo(() => {
    const query = text.trim().toLowerCase()
    return registrations.filter(
      (i) =>
        (!query ||
          i.name.toLowerCase().includes(query) ||
          i.document.includes(query) ||
          i.ritNumber.includes(query)) &&
        (!personType || i.personType === personType) &&
        (!capacity || i.capacities.some((c) => c.capacity === capacity)) &&
        (!status || i.status === status) &&
        (!procedure || lastProcedure(i).kind === procedure) &&
        (!pendingOnly || i.ritChanges.some((n) => n.status === 'pending')),
    )
  }, [registrations, text, personType, capacity, status, procedure, pendingOnly])

  if (!ritVisible(municipalities, municipalityId)) return <Navigate to="/" replace />

  const count = (c: Capacity) =>
    registrations.filter((i) => i.status === 'active' && i.capacities.some((q) => q.capacity === c))
      .length

  return (
    <>
      <PageHeader
        title="Inscripciones"
        description="Registro de Información Tributaria: personas naturales, empresas y demás sujetos, con la calidad en que actúan."
      />
      <MunicipalitySearch />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {CAPACITIES.map((c) => (
          <SelectableIndicator
            key={c}
            label={`${PLURAL[c]} activos`}
            value={count(c)}
            isActive={capacity === c}
            onClick={() => setCapacity(capacity === c ? '' : c)}
          />
        ))}
      </div>

      <Card>
        <FilterBar
          searchBox={
            <SearchBox
              placeholder="Buscar por nombre, documento o número de RIT"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          }
          actions={
            <CheckboxFilter
              label="Con solicitudes pendientes"
              isChecked={pendingOnly}
              change={setPendingOnly}
            />
          }
        >
          <Filter
            label="Tipo de persona"
            options={PERSON_TYPE_OPTIONS}
            value={personType}
            change={setPersonType}
          />
          <Filter
            label="Calidad"
            options={CAPACITY_OPTIONS}
            value={capacity}
            change={setCapacity}
          />
          <Filter label="Estado" options={STATUS_OPTIONS} value={status} change={setStatus} />
          <Filter
            label="Tipo de trámite"
            options={PROCEDURE_OPTIONS}
            value={procedure}
            change={setProcedure}
          />
        </FilterBar>

        <RegistrationsTable registrations={filteredItems} total={registrations.length} />
      </Card>
    </>
  )
}
