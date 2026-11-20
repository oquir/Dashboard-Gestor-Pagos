import { PLAIN_PX } from './PxInput.constants'

// El numero si son px pelados; null si es otra cosa ("1rem" es valido y no se reescribe).
export function toPxAmount(value: string): string | null {
  if (value.trim() === '') return ''

  const match: RegExpExecArray | null = PLAIN_PX.exec(value)

  return match ? match[1] : null
}
