import { v4 as uuidv4 } from 'uuid'
import type { GroupCheck } from '../../types/groupCheck'

// Comprobaciones de grupo en forma declarativa, sin ejecutarlas: el exportador vive en el builder y
// no puede arrastrar el runtime del simulador.

export function createGroupCheck(): GroupCheck {
  return { id: uuidv4(), label: '', enabled: true, script: '', message: '' }
}

export function enabledChecks(checks: GroupCheck[] | undefined): GroupCheck[] {
  return (checks ?? []).filter((check) => check.enabled && check.script.trim().length > 0)
}
