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

// Globo de ayuda de la interfaz del builder (Floating UI). No tiene que ver con field.tooltip, que es
// contenido del formulario que se exporta. Sale con hover, foco o toque; se cierra con Escape o al salir.
// Se pinta en un portal sobre el body con position fixed: ni el overflow de los paneles lo recorta ni
// el scale() del lienzo lo desplaza, que es lo que pasaria si colgara de un ancestro con transform.
// El tema sigue funcionando porque la clase dark vive en html, por encima del body.
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
  // Un contenido vacio no es un globo: un title opcional que llega undefined no debe pintar una burbuja en blanco.
  const isEnabled: boolean =
    !disabled && content !== undefined && content !== null && content !== ''
  const { floatingStyles, context } = useFloating({
    elements: { reference, floating },
    // Con disabled se cierra aunque estuviera abierto, por ejemplo al abrir el panel con el globo a la vista.
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
    // En pantallas tactiles no hay hover: tocarlo lo abre y lo cierra.
    useClick(context, { enabled: isEnabled, ignoreMouse: true }),
    useDismiss(context, { enabled: isEnabled }),
    useRole(context, { enabled: isEnabled, role: 'tooltip' }),
  ])
  const { isMounted, styles } = useTransitionStyles(context, { duration: TOOLTIP_FADE_DURATION })

  // Si el hijo ya trae su propio ref (dnd-kit, por ejemplo), hay que conservarlo: esparcir sus props
  // despues del nuestro lo pisaria, y sin el nuestro el globo no sabria a que anclarse.
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
            // z-[60]: por encima de ModalShell (z-50), porque el portal cuelga del body y no del modal.
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
