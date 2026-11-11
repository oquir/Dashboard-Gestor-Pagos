import { Input } from '../../atoms/Input'
import { Label } from '../../atoms/Label'
import type { LabeledInputProps } from './LabeledInput.types'

export function LabeledInput({ id, label, ...rest }: LabeledInputProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...rest} />
    </div>
  )
}
