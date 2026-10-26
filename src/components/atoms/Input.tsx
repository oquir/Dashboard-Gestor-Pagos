import type { ComponentProps } from 'react'
import { CLASE_CAMPO } from './claseCampo'

export default function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return <input className={`${CLASE_CAMPO} ${className}`} {...props} />
}
