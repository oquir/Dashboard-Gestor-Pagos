import type { ComponentProps } from 'react'
import { FIELD_CLASS } from '../../constants'

export default function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return <input className={`${FIELD_CLASS} ${className}`} {...props} />
}
