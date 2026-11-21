import { useState } from 'react'
import { FolderOpen } from 'reicon-react'
import { useFormStore } from '../../../store/formStore'
import type { RightSidebarTab } from '../../../types/ui'
import { CanvasZoomControl } from '../../molecules/CanvasZoomControl/CanvasZoomControl'
import { FormSummary } from '../../molecules/FormSummary/FormSummary'
import { PanelBlock } from '../../molecules/PanelBlock/PanelBlock'
import { RightPanelToggle } from '../../molecules/RightPanelToggle/RightPanelToggle'
import { TransferNotice } from '../../molecules/TransferNotice/TransferNotice'
import { ViewModeSwitch } from '../../molecules/ViewModeSwitch/ViewModeSwitch'
import { CanvasTabs } from '../CanvasTabs/CanvasTabs'
import { ExportButton } from '../ExportButton/ExportButton'
import { PdfDesignerButton } from '../PdfDesignerButton/PdfDesignerButton'
import { ProjectImportModal } from '../ProjectImportModal/ProjectImportModal'
import { SaveButton } from '../SaveButton/SaveButton'
import { SimulatorButton } from '../SimulatorButton/SimulatorButton'
import { StepTitleEditor } from '../StepTitleEditor/StepTitleEditor'
import { UploadButton } from '../UploadButton/UploadButton'
import {
  OPEN_PROJECT_BUTTON_CLASSES,
  PANEL_COLLAPSE_BUTTON_CLASSES,
  PANEL_TAB_ACTIVE_CLASSES,
  PANEL_TAB_BASE_CLASSES,
  PANEL_TAB_DROP_DOT_CLASSES,
  PANEL_TAB_INACTIVE_CLASSES,
  TABS,
} from './RightSidebar.constants'
import { Tooltip } from '../../atoms'
import { ENTER_RISE_CLASSES } from '../../../constants'

export function RightSidebar() {
  const formSteps = useFormStore((state) => state.formSteps)
  const introSteps = useFormStore((state) => state.introModal.steps)
  const activeCanvas = useFormStore((state) => state.activeCanvas)
  const viewMode = useFormStore((state) => state.canvasViewMode)
  const setViewMode = useFormStore((state) => state.setCanvasViewMode)
  const activeTab = useFormStore((state) => state.rightSidebarTab)
  const setActiveTab = useFormStore((state) => state.setRightSidebarTab)
  const rowDrag = useFormStore((state) => state.rowDrag)
  const draggingFieldId = useFormStore((state) => state.draggingFieldId)
  const [isImportOpen, setImportOpen] = useState<boolean>(false)

  const isIntro: boolean = activeCanvas.type === 'introStep'
  const canvasLabel: string = isIntro ? 'Modal de entrada' : 'Formulario'

  // El numero ata el chip de la grilla con el titulo que se edita debajo.
  const activeStepIndex: number = (isIntro ? introSteps : formSteps).findIndex(
    (step) => step.stepId === activeCanvas.stepId,
  )
  const activeStepLabel: string =
    activeStepIndex >= 0 ? `Paso ${activeStepIndex + 1} · ${canvasLabel}` : canvasLabel
  const stepCountLabel: string = `${formSteps.length} ${formSteps.length === 1 ? 'paso' : 'pasos'}`

  // Durante un arrastre manda la pestana Pasos: tiene las zonas de soltar para mudar a otro paso.
  // Es derivado: al soltar vuelve a la elegida.
  const isTransferring: boolean = rowDrag !== null || draggingFieldId !== null
  const visibleTab: RightSidebarTab = isTransferring ? 'steps' : activeTab

  return (
    <div className="flex h-full flex-col">
      {/* La importancia crece hacia el borde: los secundarios a la izquierda y Subir, el primario,
          pegado al boton de plegar. Todo con texto, y "PDF" corto: Guardar, Abrir y Exportar bajaron al
          bloque Formulario. Medir en 295px utiles si se cambia una etiqueta. */}
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        <SimulatorButton />
        <PdfDesignerButton shortLabel />
        <div className="ml-auto flex items-center gap-1">
          <UploadButton />
          <RightPanelToggle className={PANEL_COLLAPSE_BUTTON_CLASSES} iconSize={14} />
        </div>
      </div>

      {/* El zoom es del lienzo, no de una seccion: visible con cualquier pestana. */}
      <nav
        aria-label="Secciones del panel"
        className="flex items-stretch gap-0.5 border-b border-border px-3"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`${PANEL_TAB_BASE_CLASSES} ${
              visibleTab === tab.id ? PANEL_TAB_ACTIVE_CLASSES : PANEL_TAB_INACTIVE_CLASSES
            }`}
          >
            {tab.label}
            {isTransferring && tab.id === 'steps' && (
              <span className={PANEL_TAB_DROP_DOT_CLASSES} />
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center">
          <CanvasZoomControl />
        </div>
      </nav>

      {/* min-h-0 deja que se encoja: sin el, el desborde escapa y el panel entero hace scroll. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TransferNotice />

        {/* Key por pestana: al cambiar, el contenido se remonta y entra. */}
        <div key={visibleTab} className={`flex min-h-0 flex-1 flex-col ${ENTER_RISE_CLASSES}`}>
          {visibleTab === 'project' && (
            <>
              <PanelBlock title="Vista">
                <ViewModeSwitch activeMode={viewMode} onSelect={setViewMode} />
              </PanelBlock>

              <PanelBlock title="Formulario">
                <FormSummary />
                {/* Los terciarios del formulario, a partes iguales: se guarda solo, y Abrir y Exportar
                    son las dos caras del mismo archivo. */}
                <div className="mt-1 grid grid-cols-3 gap-1">
                  <SaveButton />
                  <Tooltip content="Abrir un formulario exportado (.json). Reemplaza el actual, con confirmación.">
                    <button
                      type="button"
                      onClick={() => setImportOpen(true)}
                      className={OPEN_PROJECT_BUTTON_CLASSES}
                    >
                      <FolderOpen size={13} />
                      Abrir…
                    </button>
                  </Tooltip>
                  <ExportButton />
                </div>
              </PanelBlock>
            </>
          )}

          {visibleTab === 'steps' && (
            <>
              <PanelBlock
                title="Pasos"
                action={<span className="text-[10px] text-fg-muted">{stepCountLabel}</span>}
              >
                <CanvasTabs />
              </PanelBlock>

              <PanelBlock
                title="Paso activo"
                action={<span className="text-[10px] text-fg-muted">{activeStepLabel}</span>}
              >
                <StepTitleEditor />
              </PanelBlock>
            </>
          )}
        </div>
      </div>

      {isImportOpen && <ProjectImportModal onClose={() => setImportOpen(false)} />}
    </div>
  )
}
