import { Danger, InfoCircle, TickCircle, Warning } from 'reicon-react'
import type { ToasterProps } from 'sonner'

/** Clases de cada aviso: Sonner va sin estilos propios y toma los colores por rol del dashboard. */
export const TOAST_CLASSES: NonNullable<ToasterProps['toastOptions']>['classNames'] = {
  toast:
    'flex w-full items-start gap-3 rounded-lg bg-surface px-4 py-3 text-sm text-fg-strong shadow-lg ring-1 ring-inset ring-border sm:w-96',
  success: 'bg-secondary-surface text-secondary-fg ring-secondary-border',
  error: 'bg-danger-surface text-danger-fg ring-danger-border',
  warning: 'bg-warning-surface text-warning-fg ring-warning-border',
  info: 'bg-brand-surface text-brand-fg ring-brand-border-soft',
  icon: 'mt-0.5 shrink-0',
  title: 'font-medium',
  description: 'mt-0.5 opacity-90',
  actionButton:
    'ml-auto shrink-0 self-center rounded-md px-2 py-1 text-xs font-medium underline hover:bg-surface/60',
}

export const TOAST_ICONS: ToasterProps['icons'] = {
  success: <TickCircle className="size-4" aria-hidden />,
  error: <Danger className="size-4" aria-hidden />,
  warning: <Warning className="size-4" aria-hidden />,
  info: <InfoCircle className="size-4" aria-hidden />,
}

/** Debajo de la barra superior, que es fija, para no taparla. */
export const TOAST_OFFSET = { top: 72, right: 24 }
export const TOAST_MOBILE_OFFSET = { top: 72, right: 16, left: 16 }
