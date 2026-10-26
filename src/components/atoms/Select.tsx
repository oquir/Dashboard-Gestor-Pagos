import type { ComponentProps } from 'react'
import { CLASE_CAMPO } from './claseCampo'

export default function Select({ className = '', ...props }: ComponentProps<'select'>) {
  return <select className={`${CLASE_CAMPO} pr-8 ${className}`} {...props} />
}
