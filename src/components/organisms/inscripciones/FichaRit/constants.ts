import type { Calidad } from '../../../../types'

export const HABILITA: Record<Calidad, string> = {
  contribuyente: 'Declara ICA anual.',
  agente_retenedor: 'Declara ReteICA: el portal solo la habilita con esta responsabilidad en el RIT.',
  autorretenedor: 'Declara AutoReteICA; a este sujeto no se le practica ReteICA.',
}
