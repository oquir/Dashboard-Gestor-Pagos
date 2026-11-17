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
import {
  TOOLTIP_FADE_DURATION,
  TOOLTIP_OFFSET,
  TOOLTIP_OPEN_DELAY,
  TOOLTIP_VIEWPORT_PADDING,
} from './Tooltip.constants'
import type { TooltipProps } from './Tooltip.types'

// Globo de ayuda de la interfaz del builder (Floating UI). No tiene que ver con field.tooltip, que es
// contenido del formulario que se exporta. Sale con hover, foco o toque; se cierra con Escape o al salir.
// Va con position fixed: el overflow de los paneles no lo recorta. Ningun ancestro puede tener
// transform, filter ni will-change, porque crearian un bloque contenedor y lo desplazarian.
export function Tooltip({
  content,
  children,
  placement = 'top',
  className = '',
  disabled = false,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  // Los elementos van en estado y no con los refs de Floating UI: la regla react-hooks/refs no deja leerlos al pintar.
  const [reference, setReference] = useState<Element | null>(null)
  const [floating, setFloating] = useState<HTMLElement | null>(null)
  const { floatingStyles, context } = useFloating({
    elements: { reference, floating },
    // Con disabled se cierra aunque estuviera abierto, por ejemplo al abrir el panel con el globo a la vista.
    open: isOpen && !disabled,
    onOpenChange: setIsOpen,
    placement,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [offset(TOOLTIP_OFFSET), flip(), shift({ padding: TOOLTIP_VIEWPORT_PADDING })],
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { enabled: !disabled, mouseOnly: true, delay: { open: TOOLTIP_OPEN_DELAY } }),
    useFocus(context, { enabled: !disabled }),
    // En pantallas tactiles no hay hover: tocarlo lo abre y lo cierra.
    useClick(context, { enabled: !disabled, ignoreMouse: true }),
    useDismiss(context, { enabled: !disabled }),
    useRole(context, { enabled: !disabled, role: 'tooltip' }),
  ])
  const { isMounted, styles } = useTransitionStyles(context, { duration: TOOLTIP_FADE_DURATION })

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
