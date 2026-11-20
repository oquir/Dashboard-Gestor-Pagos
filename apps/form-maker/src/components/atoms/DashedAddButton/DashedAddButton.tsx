import { Tooltip } from '../Tooltip'
import type { DashedAddButtonProps } from './DashedAddButton.types'

// Deshabilitado no recibe el puntero: el Tooltip cuelga de un span que lo envuelve.
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
