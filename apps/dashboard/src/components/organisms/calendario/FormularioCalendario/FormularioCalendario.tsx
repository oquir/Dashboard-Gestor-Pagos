import { useState } from 'react'
import { TODOS_ACTIVOS } from '../../../../constants'
import { conCargas } from '../../../../lib/calendario'
import { erroresCalendario } from '../../../../lib/configuracion'
import { nombreCompleto } from '../../../../lib/formato'
import { useSesion } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import type { ConfigMunicipio } from '../../../../types'
import { hoy } from '../../../../utils'
import { BarraGuardar } from '../../../molecules'
import SeccionCalendario from '../SeccionCalendario'
import SeccionProntoPago from '../SeccionProntoPago'
import type { FormularioCalendarioProps } from './FormularioCalendario.types'

/**
 * Vencimientos y pronto pago del municipio como borrador: se validan mientras se editan y al final se guardan
 * o se descartan. Solo guarda esas dos partes; lo demás de la configuración se cambia en Configuración.
 */
export default function FormularioCalendario({ config, editable }: FormularioCalendarioProps) {
  const guardarConfiguracion = useDatos((s) => s.guardarConfiguracion)
  const { usuario } = useSesion()
  // Solo se ponen fechas de los formularios que el municipio tiene activos (los define 1cero1).
  const impuestos =
    useDatos((s) => s.municipios.find((m) => m.id === config.municipioId)?.impuestos) ??
    TODOS_ACTIVOS
  const [b, setB] = useState(config)
  const [guardado, setGuardado] = useState(false)
  const cambiar = (parcial: Partial<ConfigMunicipio>) => {
    setB((actual) => ({ ...actual, ...parcial }))
    setGuardado(false)
  }

  const errores = erroresCalendario(b, impuestos)
  const cambio = JSON.stringify(b) !== JSON.stringify(config)
  const edicion = { b, cambiar, editable, errores }

  return (
    <div className="space-y-6">
      <SeccionCalendario {...edicion} impuestos={impuestos} />
      {/* El pronto pago es del ICA anual: sin ese impuesto activo no hay descuento que poner. */}
      {impuestos.ica && <SeccionProntoPago {...edicion} />}

      {editable && (
        <BarraGuardar
          cambio={cambio}
          hayErrores={Object.keys(errores).length > 0}
          guardado={guardado}
          mensajeGuardado="Calendario guardado."
          onDescartar={() => {
            setB(config)
            setGuardado(false)
          }}
          onGuardar={() => {
            // Los años que se agregaron quedan cargados hoy: lo que se presentó antes queda marcado como presentado sin calendario.
            const calendarioTributario = {
              porVigencia: conCargas(
                b.calendarioTributario.porVigencia,
                usuario ? nombreCompleto(usuario) : '',
                hoy(),
              ),
            }
            guardarConfiguracion({ ...config, calendarioTributario, prontoPago: b.prontoPago })
            setB((actual) => ({ ...actual, calendarioTributario }))
            setGuardado(true)
          }}
        />
      )}
    </div>
  )
}
