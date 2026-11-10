import type { CausalNoPresentada, MediosVentanilla } from '../../../../types'
import { CAUSALES } from './constants'

/** Cómo puede pagar el contribuyente, según lo que el municipio recibe en su ventanilla para este formulario. */
export function textoMedios({ efectivo, cheque }: MediosVentanilla) {
  const enVentanilla = efectivo && cheque ? 'en efectivo o con cheque de gerencia' : efectivo ? 'en efectivo' : cheque ? 'con cheque de gerencia' : ''
  return enVentanilla
    ? `Puede pagar en línea, descargar la declaración con código de barras para pagar en el banco o pagar ${enVentanilla} en la ventanilla del municipio.`
    : 'Puede pagar en línea o descargar la declaración con código de barras para pagar en el banco.'
}

/** Qué puede hacer el contribuyente con la declaración rechazada, que se tiene por no presentada, según la causal. */
export function textoQueHacer(causal: CausalNoPresentada) {
  return CAUSALES[causal].seCorrige
    ? 'El contribuyente puede corregirla con una sanción reducida, el 2 % de la sanción por extemporaneidad y hasta 1.300 UVT (art. 588, parágrafo 2), mientras no le notifiquen la sanción por no declarar.'
    : 'El contribuyente debe presentarla de nuevo; si ya venció el plazo, con sanción por extemporaneidad.'
}
