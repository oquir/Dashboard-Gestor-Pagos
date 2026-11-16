import type { Capacity } from '../../../../types'

export const ENABLES: Record<Capacity, string> = {
  taxpayer: 'Declara ICA anual.',
  withholding_agent:
    'Declara ReteICA: el portal solo la habilita con esta responsabilidad en el RIT.',
  self_withholder: 'Declara AutoReteICA; a este sujeto no se le practica ReteICA.',
}
