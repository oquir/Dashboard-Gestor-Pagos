import { Download } from 'reicon-react'
import { useMemo, useState } from 'react'
import { Navigate } from 'react-router'
import { Button, Card } from '../components/atoms'
import { FilterBar, SearchBox, Filter, CheckboxFilter, PageHeader } from '../components/molecules'
import { MunicipalitySearch, AuditLogTable } from '../components/organisms'
import { municipalityName, resultText } from '../components/organisms/auditLog/AuditLogTable'
import { CONTROLLERS } from '../constants'
import {
  downloadBlob,
  dataAsText,
  filterAuditLog,
  afterHours,
  createXlsx,
  roleLabel,
  formatTime,
  can,
  ofMunicipality,
  useSession,
} from '../lib'
import { useData } from '../store'
import type { Role, FilterValue } from '../types'
import { today } from '../utils'

const CONTROLLER_OPTIONS: Record<string, string> = {
  '': 'Todo controlador',
  ...Object.fromEntries(CONTROLLERS.map((c) => [c, c])),
}
const ROLE_OPTIONS: Record<FilterValue<Role>, string> = { '': 'Todo rol', ...roleLabel }

/** Lo más que cabe en una celda de Excel. */
const CELL_LIMIT = 32_767

const EXCEL_COLUMNS = [
  { title: 'N.º', width: 8 },
  { title: 'Fecha', width: 12 },
  { title: 'Hora', width: 10 },
  { title: 'Usuario', width: 22 },
  { title: 'Rol', width: 24 },
  { title: 'Municipio', width: 24 },
  { title: 'Controlador', width: 16 },
  { title: 'Acción', width: 28 },
  { title: 'Endpoint', width: 44 },
  { title: 'Resultado', width: 12 },
  { title: 'Datos enviados', width: 80 },
  { title: 'Fuera de horario', width: 10 },
]

export default function AuditLog() {
  const { user, municipalityId } = useSession()
  const auditLog = useData((s) => s.auditLog)
  const municipalities = useData((s) => s.municipalities)
  const [text, setText] = useState('')
  const [controller, setController] = useState('')
  const [role, setRole] = useState<FilterValue<Role>>('')
  const [afterHoursOnly, setAfterHoursOnly] = useState(false)
  const [failedOnly, setFailedOnly] = useState(false)

  // Con un municipio elegido no salen los registros que no son de ninguno, como el inicio de sesión de 1cero1.
  const ofVisible = useMemo(
    () => ofMunicipality(auditLog, municipalityId),
    [auditLog, municipalityId],
  )
  const filtered = useMemo(
    () => filterAuditLog(ofVisible, { text, controller, role, afterHoursOnly, failedOnly }),
    [ofVisible, text, controller, role, afterHoursOnly, failedOnly],
  )

  if (!can(user?.role, 'canSeeAuditLog')) return <Navigate to="/" replace />

  const download = () => {
    const workbook = createXlsx({
      name: 'Bitácora',
      rows: [
        EXCEL_COLUMNS.map((c) => c.title),
        ...filtered.map((r) => [
          r.id,
          r.dateTime.slice(0, 10),
          formatTime(r.dateTime),
          r.user.name,
          roleLabel[r.user.role],
          municipalityName(r, municipalities),
          r.controller,
          r.action,
          r.endpoint,
          resultText(r),
          dataAsText(r).slice(0, CELL_LIMIT),
          afterHours(r) ? 'Sí' : 'No',
        ]),
      ],
      widths: EXCEL_COLUMNS.map((c) => c.width),
    })
    downloadBlob(workbook, `bitacora_${today()}.xlsx`)
  }

  return (
    <>
      <PageHeader
        title="Bitácora"
        description="Las peticiones que cambiaron algo en el aplicativo: quién y cuándo, la acción, el endpoint, los datos que se enviaron y si salió bien. No guarda el valor que había antes. Incluye lo que hace el equipo de 1cero1 y solo la ve 1cero1. En la demo trae datos de prueba y lo que se hace en el navegador."
      />
      <MunicipalitySearch />
      <Card>
        <FilterBar
          searchBox={
            <SearchBox
              placeholder="Buscar por número, usuario, acción, endpoint o datos"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          }
          actions={
            <Button variant="primary" disabled={filtered.length === 0} onClick={download}>
              <Download className="size-4" aria-hidden /> Descargar Excel
            </Button>
          }
        >
          <Filter
            label="Controlador"
            options={CONTROLLER_OPTIONS}
            value={controller}
            change={setController}
          />
          <Filter label="Rol" options={ROLE_OPTIONS} value={role} change={setRole} />
          <CheckboxFilter
            label="Solo fuera de horario"
            isChecked={afterHoursOnly}
            change={setAfterHoursOnly}
          />
          <CheckboxFilter
            label="Solo las que fallaron"
            isChecked={failedOnly}
            change={setFailedOnly}
          />
        </FilterBar>
        <AuditLogTable entries={filtered} total={ofVisible.length} />
      </Card>
    </>
  )
}
