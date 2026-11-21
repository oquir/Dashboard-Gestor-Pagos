import { AlertCircle, AlertTriangle, InfoCircle, TickCircle2 } from 'reicon-react'
import type { ToasterProps } from 'sonner'
import { Spinner } from '../../atoms'

// Sonner va sin estilos propios y toma los colores por rol de FormMaker (los tokens de index.css).
export const TOAST_CLASSES: NonNullable<ToasterProps['toastOptions']>['classNames'] = {
  toast:
    'flex w-full items-start gap-3 rounded-lg bg-surface px-4 py-3 text-sm text-fg-strong shadow-lg ring-1 ring-inset ring-border sm:w-96',
  success: 'bg-success/10 text-success ring-success/30',
  error: 'bg-danger-surface text-danger ring-danger-border',
  warning: 'bg-warning-surface text-warning ring-warning-border',
  info: 'bg-brand-surface text-brand-fg ring-brand-border',
  // El spinner va al final y centrado, no a la izquierda como los iconos de resultado.
  loading: 'flex-row-reverse items-center [&_[data-icon]]:mt-0',
  // relative + size-4: con unstyled sonner no le da caja al icono, y su .sonner-loader (absoluto, al
  // 50%) se iba al medio del toast, al lado del titulo.
  icon: 'relative mt-0.5 size-4 shrink-0',
  content: 'min-w-0 flex-1',
  title: 'font-medium',
  description: 'mt-0.5 opacity-90',
  actionButton:
    'ml-auto shrink-0 self-center rounded-md px-2 py-1 text-xs font-medium underline hover:bg-surface/60',
}

export const TOAST_ICONS: ToasterProps['icons'] = {
  success: <TickCircle2 className="size-4" aria-hidden />,
  error: <AlertCircle className="size-4" aria-hidden />,
  warning: <AlertTriangle className="size-4" aria-hidden />,
  info: <InfoCircle className="size-4" aria-hidden />,
  loading: <Spinner className="size-4" />,
}

// Esquina inferior derecha (decision del usuario): arriba tapaba la fila de acciones del panel.
export const TOAST_OFFSET: { bottom: number; right: number } = { bottom: 24, right: 24 }
export const TOAST_MOBILE_OFFSET: { bottom: number; right: number; left: number } = {
  bottom: 16,
  right: 16,
  left: 16,
}
