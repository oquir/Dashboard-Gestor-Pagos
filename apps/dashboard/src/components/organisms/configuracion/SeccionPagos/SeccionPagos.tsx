import type { EdicionConfiguracion } from '../../../../types'
import { Interruptor, Seccion } from '../../../molecules'

/** Cómo recibe el municipio los cheques de gerencia en su ventanilla. */
export default function SeccionPagos({ b, cambiar, editable }: EdicionConfiguracion) {
  return (
    <Seccion titulo="Pagos en ventanilla" descripcion="Los cheques de gerencia que se reciben en la ventanilla del municipio.">
      <Interruptor
        etiqueta="Recibir cheques por valor parcial"
        ayuda="Apagado, el cheque debe cubrir todo el saldo pendiente de la declaración."
        valor={b.chequeParcial}
        deshabilitado={!editable}
        onChange={(v) => cambiar({ chequeParcial: v })}
      />
    </Seccion>
  )
}
