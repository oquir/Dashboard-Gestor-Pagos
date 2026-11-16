import { X } from 'reicon-react'
import { useEffect, useId, useRef } from 'react'
import { MODAL_ICON_BUTTON_CLASS, SIZE_CLASSES } from './Modal.constants'
import type { ModalProps } from './Modal.types'

/**
 * Ventana sobre la página, hecha con el `<dialog>` del navegador: se abre al montarse, atrapa el foco y se cierra
 * con la X, con Esc o al hacer clic en el fondo. Al abrirse enfoca el control marcado con `data-autofocus`, si hay uno.
 */
export default function Modal({
  title,
  description,
  close,
  footer,
  actions,
  size = 'md',
  children,
}: ModalProps) {
  const window = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = window.current
    dialog?.showModal()
    // Al abrirse, el navegador enfoca lo primero que encuentra, que es la X.
    dialog?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={window}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
      // El clic en el fondo llega al propio <dialog>; el de adentro, a sus hijos.
      onClick={(e) => e.target === e.currentTarget && close()}
      className={`${SIZE_CLASSES[size]} flex-col bg-surface p-0 text-fg-strong shadow-xl backdrop:bg-overlay open:flex`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
        <div>
          <h2 id={titleId} className="text-base font-semibold text-fg-strong">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {actions}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={close}
            className={MODAL_ICON_BUTTON_CLASS}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-5 py-4">{children}</div>
      {footer && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-border-subtle px-5 py-3">
          {footer}
        </div>
      )}
    </dialog>
  )
}
