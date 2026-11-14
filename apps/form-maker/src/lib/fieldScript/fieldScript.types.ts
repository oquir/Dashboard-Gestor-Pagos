import type { ScriptRef } from '../../types'

// Un tramo del recorrido. `depth` cuenta las llaves normales abiertas para saber cual es la que
// cierra un ${} de una plantilla y cual es una mas del codigo.
export interface ScanFrame {
  kind: 'code' | 'template'
  depth: number
}

export interface ScanResult {
  code: string
  refs: ScriptRef[]
}
