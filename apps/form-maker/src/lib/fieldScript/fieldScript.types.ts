import type { ScriptRef } from '../../types'

// depth cuenta las llaves abiertas para saber cual cierra un ${} de plantilla.
export interface ScanFrame {
  kind: 'code' | 'template'
  depth: number
}

export interface ScanResult {
  code: string
  refs: ScriptRef[]
}
