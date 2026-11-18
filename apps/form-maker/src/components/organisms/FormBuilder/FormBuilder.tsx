import { DndContext, DragOverlay } from '@dnd-kit/core'
import { lazy, Suspense } from 'react'
import { useDragAndDrop } from '../../../hooks/useDragAndDrop/useDragAndDrop'
import { useFormStore } from '../../../store/formStore'
import { ErrorBoundary } from '../../atoms/ErrorBoundary/ErrorBoundary'
import { SimulatorLoading } from '../../atoms/SimulatorLoading/SimulatorLoading'
import { AppLayout } from '../../layout/AppLayout'
import { DragPreview } from '../../molecules/DragPreview/DragPreview'
import { Canvas } from '../Canvas/Canvas'
import { CanvasToolbar } from '../CanvasToolbar/CanvasToolbar'
import { CollapsedRightSidebar } from '../CollapsedRightSidebar/CollapsedRightSidebar'
import { PdfDesignerCrashScreen } from '../PdfDesignerCrashScreen/PdfDesignerCrashScreen'
import { RightSidebar } from '../RightSidebar/RightSidebar'
import { Sidebar } from '../Sidebar/Sidebar'
import { SimulatorCrashScreen } from '../SimulatorCrashScreen/SimulatorCrashScreen'
import { OVERLAY_STYLE } from './FormBuilder.constants'

// El simulador se carga aparte: es la unica puerta a los catalogos de mentira y al zod que hidrata
// los esquemas, que juntos pesan mas que el resto de la app y no sirven para nada hasta que alguien
// abre el simulador. La frontera solo corta si nada del builder importa ese subarbol.
const FormSimulator = lazy(() =>
  import('../FormSimulator/FormSimulator').then((module) => ({ default: module.FormSimulator })),
)

// El diseñador de PDF, igual: su store, su guardado y sus hojas no le sirven a nadie hasta que se
// abre, y el formulario no importa nada de ese subarbol.
const PdfDesigner = lazy(() =>
  import('../PdfDesigner/PdfDesigner').then((module) => ({ default: module.PdfDesigner })),
)

export function FormBuilder() {
  const {
    sensors,
    activeDrag,
    collisionDetection,
    overlayModifiers,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useDragAndDrop()
  const isSimulatorOpen = useFormStore((state) => state.isSimulatorOpen)
  const isPdfDesignerOpen = useFormStore((state) => state.isPdfDesignerOpen)

  // El simulador se lleva la pantalla entera: sin sidebar, sin lienzo y sin drag and drop. Tiene
  // su propia frontera de errores, por dentro de la de toda la app: si falla, se vuelve al editor
  // sin recargar. Como solo existe mientras el simulador esta abierto, al reabrirlo empieza limpia.
  if (isSimulatorOpen) {
    return (
      <ErrorBoundary fallback={(message) => <SimulatorCrashScreen message={message} />}>
        <Suspense fallback={<SimulatorLoading />}>
          <FormSimulator />
        </Suspense>
      </ErrorBoundary>
    )
  }

  if (isPdfDesignerOpen) {
    return (
      <ErrorBoundary fallback={(message) => <PdfDesignerCrashScreen message={message} />}>
        <Suspense fallback={<SimulatorLoading label="Cargando diseñador de PDF…" />}>
          <PdfDesigner />
        </Suspense>
      </ErrorBoundary>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <AppLayout
        sidebar={<Sidebar />}
        canvas={<Canvas />}
        canvasOverlay={
          <>
            <CanvasToolbar />
            <CollapsedRightSidebar />
          </>
        }
        rightSidebar={<RightSidebar />}
      />
      {/* Sin animacion de caida para una fila: dnd-kit la devuelve volando al sitio donde empezo,
          que ya no es el suyo. El hueco se abrio antes, asi que la fila ya esta donde toca. */}
      <DragOverlay
        modifiers={overlayModifiers}
        style={OVERLAY_STYLE}
        dropAnimation={activeDrag?.source === 'canvas-row' ? null : undefined}
      >
        {activeDrag ? <DragPreview activeDrag={activeDrag} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
