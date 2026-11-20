import { useEffect } from 'react'
import { useFormStore } from '../../store'

// Refleja el modo de bajo rendimiento en el elemento raiz, como useThemeClass. Lo que necesita
// codigo lee isLowPerformance en su propio sitio.
export function usePerformanceClass() {
  const isLowPerformance = useFormStore((state) => state.isLowPerformance)

  useEffect(() => {
    document.documentElement.classList.toggle('low-performance', isLowPerformance)
  }, [isLowPerformance])
}
