import { useEffect } from 'react'
import { useFormStore } from '../../store'

// Dark mode de Tailwind por clase: refleja el estado en el elemento raiz.
export function useThemeClass() {
  const isDarkMode = useFormStore((state) => state.isDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])
}
