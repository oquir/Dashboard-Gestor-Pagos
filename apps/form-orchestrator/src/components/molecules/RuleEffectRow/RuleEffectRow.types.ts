import type { CanvasField, RuleEffect } from '../../../types'

export interface RuleEffectRowProps {
  effect: RuleEffect
  candidates: CanvasField[]
  knownNames: Set<string>
  onChange: (effect: RuleEffect) => void
  onRemove: () => void
}
