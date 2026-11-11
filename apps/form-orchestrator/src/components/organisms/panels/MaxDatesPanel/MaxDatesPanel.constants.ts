import type { DeclaracionKind } from '../../../../types'

export {
  ACTION_CLASSES,
  BADGE_EMPTY_CLASSES,
  BADGE_LOADED_CLASSES,
  HINT_CLASSES,
  INPUT_CLASSES,
} from '../../../../constants'

export const DECLARACIONES: { kind: DeclaracionKind; label: string }[] = [
  { kind: 'ica', label: 'Industria y Comercio' },
  { kind: 'reteica', label: 'Retención (ReteICA)' },
  { kind: 'autoretencionIca', label: 'Autorretención' },
]
