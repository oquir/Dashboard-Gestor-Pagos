import { Toaster as SonnerToaster } from 'sonner'
import { TOAST_CLASSES, TOAST_ICONS, TOAST_MOBILE_OFFSET, TOAST_OFFSET } from './Toaster.constants'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      offset={TOAST_OFFSET}
      mobileOffset={TOAST_MOBILE_OFFSET}
      duration={6000}
      icons={TOAST_ICONS}
      toastOptions={{ unstyled: true, classNames: TOAST_CLASSES }}
    />
  )
}
