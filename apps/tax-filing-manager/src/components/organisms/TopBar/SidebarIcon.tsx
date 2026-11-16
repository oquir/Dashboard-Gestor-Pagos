/**
 * Panel lateral con una flecha: apunta a la izquierda con el menú abierto (ocultarlo) y gira a la derecha con el menú
 * contraído (mostrarlo), al mismo ritmo que el ancho del menú. El dibujo es el de SidebarLeft2 de reicon-react, que
 * solo trae la flecha hacia la izquierda.
 */
export default function SidebarIcon({
  open,
  className = '',
}: {
  open: boolean
  className?: string
}) {
  const line = {
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M21.97 15V9C21.97 4 19.97 2 14.97 2H8.97C3.97 2 1.97 4 1.97 9V15C1.97 20 3.97 22 8.97 22H14.97C19.97 22 21.97 20 21.97 15Z"
        {...line}
      />
      <path d="M7.97 2V22" {...line} />
      <path
        d="M14.97 9.44L12.41 12L14.97 14.56"
        className={`origin-center transition-transform duration-300 ease-in-out transform-fill ${open ? '' : 'rotate-180'}`}
        {...line}
      />
    </svg>
  )
}
