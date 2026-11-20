import { useFormStore } from '../../../store'
import { Button } from '../../atoms'
import { CrashPanel } from '../../molecules'
import type { SimulatorCrashScreenProps } from './SimulatorCrashScreen.types'

// Corre scripts del autor en su propio chunk: es lo mas probable que falle. Basta con cerrarlo.
export function SimulatorCrashScreen({ message }: SimulatorCrashScreenProps) {
  const setSimulatorOpen = useFormStore((state) => state.setSimulatorOpen)

  return (
    <CrashPanel
      title="El simulador falló"
      description={
        <p>
          El simulador encontró un error y se cerró. El formulario que estás armando no se afectó:
          vuelve al editor y revisa el script o el campo que muestra el detalle técnico.
        </p>
      }
      message={message}
    >
      <Button
        variant="primary"
        onClick={() => setSimulatorOpen(false)}
        className="px-4 py-1.5 text-sm hover:cursor-pointer"
      >
        Volver al editor
      </Button>
    </CrashPanel>
  )
}
