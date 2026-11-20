import {
  CANVAS_TOOLBAR_DIVIDER_CLASSES,
  CANVAS_TOOLBAR_ICON_ACTION_CLASSES,
} from '../../../constants/uiClasses'
import { useFormStore } from '../../../store/formStore'
import { CanvasZoomControl } from '../../molecules/CanvasZoomControl/CanvasZoomControl'
import { RightPanelToggle } from '../../molecules/RightPanelToggle/RightPanelToggle'
import { TransferNotice } from '../../molecules/TransferNotice/TransferNotice'
import { ExportButton } from '../ExportButton/ExportButton'
import { PdfDesignerButton } from '../PdfDesignerButton/PdfDesignerButton'
import { SaveButton } from '../SaveButton/SaveButton'
import { SimulatorButton } from '../SimulatorButton/SimulatorButton'
import { CHIP_CLASSES, NOTICE_CLASSES } from './CollapsedRightSidebar.constants'

export function CollapsedRightSidebar() {
  const isRightSidebarOpen: boolean = useFormStore((state) => state.isRightSidebarOpen)

  if (isRightSidebarOpen) return null

  return (
    <>
      {/* No se apaga fuera de la vista lienzo: guardar, exportar y simular siguen en JSON y
          Payload. */}
      <div role="toolbar" aria-label="Acciones del formulario" className={CHIP_CLASSES}>
        <SaveButton iconOnly />
        <SimulatorButton iconOnly />
        <PdfDesignerButton iconOnly />
        <ExportButton iconOnly />
        <CanvasZoomControl />
        <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />
        <RightPanelToggle className={CANVAS_TOOLBAR_ICON_ACTION_CLASSES} />
      </div>

      {/* Mover a paso sigue escribiendo el aviso con el panel plegado; sin esto se perderian en
          silencio referencias cruzadas. */}
      <TransferNotice className={NOTICE_CLASSES} />
    </>
  )
}
