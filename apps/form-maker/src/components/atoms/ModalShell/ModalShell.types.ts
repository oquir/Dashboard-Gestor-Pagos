import type { KeyboardEvent, ReactNode, Ref } from 'react'

export interface ModalShellProps {
  title: ReactNode
  children: ReactNode
  // Rotulo en pastilla sobre el titulo, para nombrar la herramienta cuando el titulo es el campo.
  eyebrow?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  // Sin onClose no hay X: el usuario tiene que elegir.
  onClose?: () => void
  maxWidthClassName?: string
  // Para modales con teclado propio (useModalKeyGuard).
  dialogRef?: Ref<HTMLDivElement>
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void
}
