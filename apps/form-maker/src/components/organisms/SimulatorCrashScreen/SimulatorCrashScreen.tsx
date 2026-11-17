import { useFormStore } from '../../../store'
import { Button } from '../../atoms'
import { CrashPanel } from '../../molecules'
import type { SimulatorCrashScreenProps } from './SimulatorCrashScreen.types'

// El simulador corre los scripts del autor y se carga en un chunk aparte, asi que es lo mas
// probable que falle: un script que rompe lo que pinta el simulador, o el chunk que no baja. Aca
// el editor no se toco, por eso basta con cerrar el simulador para volver a el sin perder nada.
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
