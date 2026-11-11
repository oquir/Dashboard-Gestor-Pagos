import type { CausalNoPresentada } from '../../../../types'
import type { Causal } from './types'

/**
 * Causales del art. 580 del Estatuto Tributario, en el orden de sus literales. Las de los literales a), b) y d) se
 * pueden corregir (art. 588, parágrafo 2); la del c), no.
 */
export const CAUSALES: Record<CausalNoPresentada, Causal> = {
  lugar: {
    literal: 'a',
    etiqueta: 'Lugar de presentación',
    descripcion: 'No se presentó en un lugar autorizado.',
    seCorrige: true,
  },
  identificacion: {
    literal: 'b',
    etiqueta: 'Identificación del declarante',
    descripcion: 'No trae la identificación del declarante, o la trae equivocada.',
    seCorrige: true,
  },
  bases_gravables: {
    literal: 'c',
    etiqueta: 'Bases gravables',
    descripcion: 'No trae los datos necesarios para identificar las bases gravables.',
    seCorrige: false,
  },
  firmas: {
    literal: 'd',
    etiqueta: 'Firmas',
    descripcion:
      'No la firmó quien debía declarar, o le falta la firma del contador o del revisor fiscal cuando la ley la exige.',
    seCorrige: true,
  },
}
