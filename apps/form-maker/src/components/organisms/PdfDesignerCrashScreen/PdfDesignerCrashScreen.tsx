import { useFormStore } from '../../../store'
import { Button } from '../../atoms'
import { CrashPanel } from '../../molecules'
import type { PdfDesignerCrashScreenProps } from './PdfDesignerCrashScreen.types'

// El diseñador de PDF se carga en un chunk aparte y tiene su propio store, asi que si falla el
// formulario no se toco: basta con cerrarlo. Lo ultimo guardado del diseño sigue en su llave.
export function PdfDesignerCrashScreen({ message }: PdfDesignerCrashScreenProps) {
  const setPdfDesignerOpen = useFormStore((state) => state.setPdfDesignerOpen)

  return (
    <CrashPanel
      title="El diseñador de PDF falló"
      description={
        <p>
          El diseñador encontró un error y se cerró. El formulario no se afectó, y el diseño quedó
          como se guardó por última vez.
        </p>
      }
      message={message}
    >
      <Button
        variant="primary"
        onClick={() => setPdfDesignerOpen(false)}
        className="px-4 py-1.5 text-sm hover:cursor-pointer"
      >
        Volver al formulario
      </Button>
    </CrashPanel>
  )
}
