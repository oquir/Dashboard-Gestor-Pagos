import { useEffect } from 'react'
import { useFormStore } from '../../store'

// Refleja el modo de bajo rendimiento en el elemento raiz, igual que useThemeClass con el oscuro.
// Lo visual sale de esa clase en index.css (sin transiciones ni animaciones); lo que necesita
// codigo -la rueda del zoom, la ficha al arrastrar una fila, el scroll sin suavizado- lee
// isLowPerformance del store en su propio sitio.
export function usePerformanceClass() {
  const isLowPerformance = useFormStore((state) => state.isLowPerformance)

  useEffect(() => {
    document.documentElement.classList.toggle('low-performance', isLowPerformance)
  }, [isLowPerformance])
}
