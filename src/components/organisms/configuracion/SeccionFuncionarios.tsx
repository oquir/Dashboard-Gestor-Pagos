import type { EdicionConfiguracion } from '../../../types'
import { Interruptor, Seccion } from '../../molecules'

/** Lo que ven los funcionarios del municipio. */
export default function SeccionFuncionarios({ b, cambiar, editable }: EdicionConfiguracion) {
  return (
    <Seccion titulo="Funcionarios" descripcion="Lo que ven los funcionarios del municipio.">
      <Interruptor
        etiqueta="Ocultar el recaudo del municipio"
        ayuda="Encendido, los funcionarios no ven el recaudo del año en Inicio ni en Pagos, ni la gráfica de recaudo por años."
        valor={b.ocultarRecaudoAFuncionarios}
        deshabilitado={!editable}
        onChange={(v) => cambiar({ ocultarRecaudoAFuncionarios: v })}
      />
    </Seccion>
  )
}
