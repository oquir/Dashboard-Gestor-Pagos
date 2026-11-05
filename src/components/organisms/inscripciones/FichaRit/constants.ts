import type { Calidad, FirmanteContable } from '../../../../types'

export const CARGO_CONTABLE: Record<FirmanteContable['cargo'], string> = { contador: 'Contador', revisor_fiscal: 'Revisor fiscal' }

export const HABILITA: Record<Calidad, string> = {
  contribuyente: 'Declara ICA anual.',
  agente_retenedor: 'Declara ReteICA: el portal solo la habilita con esta responsabilidad en el RIT.',
  autorretenedor: 'Declara AutoReteICA; a este sujeto no se le practica ReteICA.',
}
