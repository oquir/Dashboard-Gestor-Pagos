import { Toaster as SonnerToaster } from 'sonner'
import { TOAST_CLASSES, TOAST_ICONS, TOAST_MOBILE_OFFSET, TOAST_OFFSET } from './Toaster.constants'

/**
 * Avisos que confirman una acción terminada (guardar, cargar, crear) y se van solos. Se lanzan con
 * `toast.success(...)` de sonner desde cualquier parte. Lo que el usuario debe poder releer, o lo que
 * pasa dentro de un Modal (el `<dialog>` tapa todo lo demás), sigue siendo un Notice en la página.
 */
export default function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      offset={TOAST_OFFSET}
      mobileOffset={TOAST_MOBILE_OFFSET}
      duration={5000}
      icons={TOAST_ICONS}
      toastOptions={{ unstyled: true, classNames: TOAST_CLASSES }}
    />
  )
}
