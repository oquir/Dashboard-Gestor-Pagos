import { cloneElement, isValidElement, useId } from 'react'
import InfoTip from '../InfoTip'
import type { FieldProps } from './Field.types'

/**
 * Campo con su etiqueta, su ayuda o su error. Con `info`, la etiqueta y el globo van en una fila aparte y el control se
 * enlaza por `id`: si el botón ⓘ estuviera dentro del `<label>`, el label quedaría asociado a él y no al control.
 */
export default function Field({ label, help, error, info, children }: FieldProps) {
  const id = useId()
  const message = error ? (
    <span className="mt-1 block text-xs text-danger">{error}</span>
  ) : (
    help && <span className="mt-1 block text-xs text-fg-muted">{help}</span>
  )

  if (!info)
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-fg">{label}</span>
        {children}
        {message}
      </label>
    )

  return (
    <div className="block">
      <div className="mb-1 flex items-center gap-1">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        <InfoTip label={label} content={info} />
      </div>
      {isValidElement<{ id?: string }>(children)
        ? cloneElement(children, { id: children.props.id ?? id })
        : children}
      {message}
    </div>
  )
}
