import type { MediosVentanilla } from '../../../../types'

/** Cómo puede pagar el contribuyente, según lo que el municipio recibe en su ventanilla para este formulario. */
export function textoMedios({ efectivo, cheque }: MediosVentanilla) {
  const enVentanilla = efectivo && cheque ? 'en efectivo o con cheque de gerencia' : efectivo ? 'en efectivo' : cheque ? 'con cheque de gerencia' : ''
  return enVentanilla
    ? `Puede pagar en línea, descargar la declaración con código de barras para pagar en el banco o pagar ${enVentanilla} en la ventanilla del municipio.`
    : 'Puede pagar en línea o descargar la declaración con código de barras para pagar en el banco.'
}
