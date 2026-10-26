import type { ComponentProps } from 'react'
import { CLASE_CAMPO } from './claseCampo'

export default function Textarea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return <textarea className={`${CLASE_CAMPO} ${className}`} {...props} />
}
