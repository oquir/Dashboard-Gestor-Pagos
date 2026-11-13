import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react'
import { cloneElement, useState } from 'react'
import { FADE_DURATION, OFFSET, OPEN_DELAY, VIEWPORT_PADDING } from './Tooltip.constants'
import type { TooltipProps } from './Tooltip.types'

/**
 * Globo de ayuda sobre un elemento, con Floating UI: sale al pasar el mouse, al enfocarlo con el teclado o al tocarlo
 * en el celular; se cierra con Escape o al salir. Se voltea y se corre si no cabe, y sigue al elemento con el scroll.
 * Va con position fixed para que el scroll de las tablas no lo recorte y para que funcione dentro de los modales.
 */
export default function Tooltip({
  content,
  children,
  placement = 'top',
  className = '',
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  // Los elementos van en estado y no con los refs de Floating UI: la regla react-hooks/refs no deja leerlos al pintar.
  const [reference, setReference] = useState<Element | null>(null)
  const [floating, setFloating] = useState<HTMLElement | null>(null)
  const { floatingStyles, context } = useFloating({
    elements: { reference, floating },
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [offset(OFFSET), flip(), shift({ padding: VIEWPORT_PADDING })],
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { mouseOnly: true, delay: { open: OPEN_DELAY } }),
    useFocus(context),
    // En pantallas táctiles no hay hover: tocarlo lo abre y lo cierra.
    useClick(context, { ignoreMouse: true }),
    useDismiss(context),
    useRole(context, { role: 'tooltip' }),
  ])
  const { isMounted, styles } = useTransitionStyles(context, { duration: FADE_DURATION })

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref: setReference, ...children.props }))}
      {isMounted && (
        <div
          ref={setFloating}
          style={{ ...floatingStyles, ...styles }}
          className={`z-50 max-w-xs rounded-lg bg-inverse px-3 py-2 text-xs text-on-inverse shadow-lg ${className}`}
          {...getFloatingProps()}
        >
          {content}
        </div>
      )}
    </>
  )
}
