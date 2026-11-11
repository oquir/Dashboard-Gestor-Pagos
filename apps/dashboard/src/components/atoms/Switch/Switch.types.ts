import type { ComponentProps } from 'react'

export type SwitchProps = Omit<ComponentProps<'input'>, 'type' | 'role'>
