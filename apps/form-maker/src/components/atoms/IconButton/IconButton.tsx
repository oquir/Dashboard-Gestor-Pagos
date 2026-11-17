import { Tooltip } from '../Tooltip'
import type { IconButtonProps } from './IconButton.types'

// El title de un boton de iconos se pinta con Tooltip y no con el globo nativo del navegador, y pasa a
// ser su nombre accesible (aria-label) salvo que el llamador ponga uno. Sin title es un button normal.
export function IconButton({
  className = '',
  children,
  title,
  'aria-label': ariaLabel,
  ...rest
}: IconButtonProps) {
  const button = (
    <button type="button" className={className} aria-label={ariaLabel ?? title} {...rest}>
      {children}
    </button>
  )

  return title ? <Tooltip content={title}>{button}</Tooltip> : button
}
