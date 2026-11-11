import type { ComponentProps } from 'react'
import { FIELD_CLASS } from '../../constants'

export default function Select({ className = '', ...props }: ComponentProps<'select'>) {
  return <select className={`${FIELD_CLASS} pr-8 ${className}`} {...props} />
}
