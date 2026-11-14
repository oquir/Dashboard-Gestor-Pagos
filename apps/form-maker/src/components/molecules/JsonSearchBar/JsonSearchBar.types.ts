import type { RefObject } from 'react'
import type { JsonSearchState } from '../../../types'

export interface JsonSearchBarProps {
  search: JsonSearchState
  inputRef: RefObject<HTMLInputElement | null>
}
