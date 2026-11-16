import type { NotFiledGround } from '../../../../types'
import type { Ground } from './PriorApproval.types'

/**
 * Causales del art. 580 del Estatuto Tributario, en el orden de sus literales. Las de los literales a), b) y d) se
 * pueden corregir (art. 588, parágrafo 2); la del c), no.
 */
export const GROUNDS: Record<NotFiledGround, Ground> = {
  place: {
    literal: 'a',
    label: 'Lugar de presentación',
    description: 'No se presentó en un lugar autorizado.',
    isCorrected: true,
  },
  identification: {
    literal: 'b',
    label: 'Identificación del declarante',
    description: 'No trae la identificación del declarante, o la trae equivocada.',
    isCorrected: true,
  },
  taxable_bases: {
    literal: 'c',
    label: 'Bases gravables',
    description: 'No trae los datos necesarios para identificar las bases gravables.',
    isCorrected: false,
  },
  signatures: {
    literal: 'd',
    label: 'Firmas',
    description:
      'No la firmó quien debía declarar, o le falta la firma del contador o del revisor fiscal cuando la ley la exige.',
    isCorrected: true,
  },
}
