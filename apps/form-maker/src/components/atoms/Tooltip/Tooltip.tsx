import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react'
import { cloneElement, type Ref, useState } from 'react'
import {
  TOOLTIP_FADE_DURATION,
  TOOLTIP_OFFSET,
  TOOLTIP_OPEN_DELAY,
  TOOLTIP_VIEWPORT_PADDING,
} from './Tooltip.constants'
import type { TooltipProps } from './Tooltip.types'

// Globo de ayuda del builder (no es field.tooltip, que se exporta). Va en un portal con position
// fixed: asi no lo recortan los paneles ni lo mueve el scale() del lienzo.
export function Tooltip({
  content,
  children,
  placement = 'top',
  className = '',
  disabled = false,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  // En estado y no en refs: la regla react-hooks/refs no deja leer refs al pintar.
  const [reference, setReference] = useState<Element | null>(null)
  const [floating, setFloating] = useState<HTMLElement | null>(null)
  const isEnabled: boolean =
    !disabled && content !== undefined && content !== null && content !== ''
  const { floatingStyles, context } = useFloating({
    elements: { reference, floating },
    open: isOpen && isEnabled,
    onOpenChange: setIsOpen,
    placement,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [offset(TOOLTIP_OFFSET), flip(), shift({ padding: TOOLTIP_VIEWPORT_PADDING })],
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { enabled: isEnabled, mouseOnly: true, delay: { open: TOOLTIP_OPEN_DELAY } }),
    useFocus(context, { enabled: isEnabled }),
    // Sin hover en pantallas tactiles: el toque lo abre y lo cierra.
    useClick(context, { enabled: isEnabled, ignoreMouse: true }),
    useDismiss(context, { enabled: isEnabled }),
    useRole(context, { enabled: isEnabled, role: 'tooltip' }),
  ])
  const { isMounted, styles } = useTransitionStyles(context, { duration: TOOLTIP_FADE_DURATION })

  // Conserva el ref propio del hijo (dnd-kit): sin el merge uno pisaria al otro.
  const childRef: Ref<Element> | undefined = (children.props as { ref?: Ref<Element> }).ref
  const mergedRef = useMergeRefs([setReference, childRef])

  return (
    <>
      {cloneElement(children, getReferenceProps({ ...children.props, ref: mergedRef }))}
      {isMounted && (
        <FloatingPortal>
          <div
            ref={setFloating}
            style={{ ...floatingStyles, ...styles }}
            // z-[60]: encima de ModalShell (z-50), porque el portal cuelga del body.
            className={`z-[60] max-w-xs rounded-lg bg-inverse px-3 py-2 text-xs text-on-inverse shadow-lg ${className}`}
            {...getFloatingProps()}
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
