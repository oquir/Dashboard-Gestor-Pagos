import { X } from 'reicon-react'
import { useEffect, useId, useRef } from 'react'
import type { ModalProps } from './types'

/**
 * Ventana sobre la página, hecha con el `<dialog>` del navegador: se abre al montarse, atrapa el foco y se cierra
 * con la X, con Esc o al hacer clic en el fondo. Al abrirse enfoca el control marcado con `data-autofocus`, si hay uno.
 */
export default function Modal({ titulo, descripcion, cerrar, pie, children }: ModalProps) {
  const ventana = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ventana.current
    dialogo?.showModal()
    // Al abrirse, el navegador enfoca lo primero que encuentra, que es la X.
    dialogo?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    return () => dialogo?.close()
  }, [])

  return (
    <dialog
      ref={ventana}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault()
        cerrar()
      }}
      // El clic en el fondo llega al propio <dialog>; el de adentro, a sus hijos.
      onClick={(e) => e.target === e.currentTarget && cerrar()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/40"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 id={idTitulo} className="text-base font-semibold text-slate-900">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>}
        </div>
        <button type="button" aria-label="Cerrar" onClick={cerrar} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
      {pie && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-3">{pie}</div>}
    </dialog>
  )
}
