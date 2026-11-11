import type { ComponentProps } from 'react'

export type ConmutadorProps = Omit<ComponentProps<'input'>, 'type' | 'role'>
