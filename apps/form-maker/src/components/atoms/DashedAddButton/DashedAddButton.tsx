import { Tooltip } from '../Tooltip'
import type { DashedAddButtonProps } from './DashedAddButton.types'

// Igual que IconButton: el title sale en un Tooltip, y como el boton lleva texto no se le pone aria-label.
// Un boton deshabilitado no recibe el puntero, asi que ahi el globo cuelga de un span que lo envuelve:
// es lo que deja leer por que no se puede usar.
export function DashedAddButton({
  className = '',
  children,
  title,
  ...rest
}: DashedAddButtonProps) {
  const button = (
    <button
      type="button"
      className={`rounded-md border border-dashed text-xs font-medium transition-colors hover:cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </button>
  )

  if (!title) return button
  if (!rest.disabled) return <Tooltip content={title}>{button}</Tooltip>
  return (
    <Tooltip content={title}>
      <span className="inline-flex">{button}</span>
    </Tooltip>
  )
}
