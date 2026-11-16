import type { ComponentProps } from 'react'
import { FIELD_CLASS } from '../../constants'

export default function Textarea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return <textarea className={`${FIELD_CLASS} ${className}`} {...props} />
}
