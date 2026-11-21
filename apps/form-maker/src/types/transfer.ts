// Campo o fila: solo cambia la carga; reglas, aterrizaje y aviso son los mismos.
export type TransferPayload = { kind: 'field'; fieldId: string } | { kind: 'row'; rowId: string }

export interface TransferCheck {
  allowed: boolean
  reason?: string
}

export type TransferTabState = 'idle' | 'ready' | 'rejected'
