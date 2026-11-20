import {
  findFieldById,
  getActiveRows,
  getAllFields,
  getSelectedFieldId,
  useFormStore,
} from '../../../store'
import { PanelHeader } from '../../atoms'
import { SelectionSummary, SidebarTabRail } from '../../molecules'
import { FieldPalette } from '../FieldPalette'
import { ApiMappingPanel } from '../panels/ApiMappingPanel'
import { AttributesPanel } from '../panels/AttributesPanel'
import { CatalogsPanel } from '../panels/CatalogsPanel'
import { FormScriptEditor } from '../panels/FormScriptEditor'
import { LogicPanel } from '../panels/LogicPanel'
import { MaxDatesPanel } from '../panels/MaxDatesPanel'
import { StylesPanel } from '../panels/StylesPanel'
import { ValidationsPanel } from '../panels/ValidationsPanel'
import { BANK_TABS, FIELD_TABS, RAIL_DIVIDER_BEFORE, TABS } from './Sidebar.constants'
import { ENTER_RISE_CLASSES } from '../../../constants'

export function Sidebar() {
  const activeTab = useFormStore((state) => state.sidebarTab)
  const setActiveTab = useFormStore((state) => state.setSidebarTab)
  const rows = useFormStore(getActiveRows)
  const selectedFieldIds = useFormStore((state) => state.selectedFieldIds)
  const selectedFieldId = useFormStore(getSelectedFieldId)
  const selectedField = findFieldById(rows, selectedFieldId)
  const activeTabDef = TABS.find((tab) => tab.id === activeTab)
  const isDarkMode = useFormStore((state) => state.isDarkMode)
  const toggleDarkMode = useFormStore((state) => state.toggleDarkMode)
  const isSidebarOpen = useFormStore((state) => state.isSidebarOpen)
  const setSidebarOpen = useFormStore((state) => state.setSidebarOpen)
  // Con varios seleccionados las pestanas de campo no tienen a quien editar, y Logica no cae al
  // preludio.
  const isMultiSelection: boolean = selectedFieldIds.length > 1
  const isFieldTab: boolean = FIELD_TABS.includes(activeTab)

  return (
    <div className="flex h-full">
      <SidebarTabRail
        tabs={TABS}
        dividerBefore={RAIL_DIVIDER_BEFORE}
        activeTab={activeTab}
        onSelect={(tab) => {
          if (isSidebarOpen && tab === activeTab) {
            setSidebarOpen(false)
            return
          }
          setActiveTab(tab)
          setSidebarOpen(true)
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Contraido sigue montado: sin inert, el Tab entraba a sus botones y desplazaba el aside. */}
      <section
        aria-label={activeTabDef?.label ?? 'Panel de edición'}
        inert={!isSidebarOpen}
        className="flex min-w-0 flex-1 flex-col"
      >
        <PanelHeader
          title={activeTabDef?.label ?? ''}
          subtitle={
            activeTab === 'fields' ? (
              'Haz clic o arrastra un campo al lienzo'
            ) : BANK_TABS.includes(activeTab) ? (
              'Datos de prueba del simulador'
            ) : isMultiSelection && isFieldTab ? (
              `${selectedFieldIds.length} campos seleccionados`
            ) : selectedField ? (
              <>
                Editando <code className="font-mono text-fg-muted">{selectedField.name}</code>
              </>
            ) : activeTab === 'logic' ? (
              'Sin campo seleccionado: funciones compartidas por todos los scripts'
            ) : (
              'Selecciona un campo en el lienzo para editarlo'
            )
          }
        />

        <div className="flex-1 overflow-y-auto p-4 text-sm text-fg-muted">
          {/* Key por pestana: al cambiar, el contenido se remonta y entra. */}
          <div key={activeTab} className={ENTER_RISE_CLASSES}>
            {activeTab === 'fields' && <FieldPalette />}
            {isMultiSelection && isFieldTab && (
              <SelectionSummary
                fields={getAllFields(rows).filter((field) => selectedFieldIds.includes(field.id))}
              />
            )}
            {activeTab !== 'fields' &&
              activeTab !== 'catalogs' &&
              activeTab !== 'fechas' &&
              activeTab !== 'logic' &&
              !selectedField &&
              !isMultiSelection && (
                // Un clic en un campo no abre esta pestana (decision del usuario): el vacio dice
                // que gestos la abren.
                <p>
                  Sin campo seleccionado. Haz doble clic en un campo del lienzo para editarlo aquí,
                  o clic derecho para abrir su menú.
                </p>
              )}
            {selectedField && activeTab === 'attributes' && (
              <AttributesPanel field={selectedField} />
            )}
            {selectedField && activeTab === 'validations' && (
              <ValidationsPanel field={selectedField} />
            )}
            {selectedField && activeTab === 'styles' && <StylesPanel field={selectedField} />}
            {/* Con campo, su script; sin campo, el del formulario. */}
            {activeTab === 'logic' &&
              !isMultiSelection &&
              (selectedField ? <LogicPanel field={selectedField} /> : <FormScriptEditor />)}
            {selectedField && activeTab === 'apiMapping' && (
              <ApiMappingPanel field={selectedField} />
            )}
            {activeTab === 'catalogs' && <CatalogsPanel />}
            {activeTab === 'fechas' && <MaxDatesPanel />}
          </div>
        </div>
      </section>
    </div>
  )
}
