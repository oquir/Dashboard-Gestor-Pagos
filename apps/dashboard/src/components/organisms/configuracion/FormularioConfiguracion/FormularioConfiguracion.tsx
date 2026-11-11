import { useState } from 'react'
import { TODOS_ACTIVOS } from '../../../../constants'
import { erroresConfiguracion } from '../../../../lib/configuracion'
import { formulariosDe, IMPUESTOS, recibeCheques } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import type { ConfigMunicipio } from '../../../../types'
import { BarraGuardar } from '../../../molecules'
import SeccionAprobacionPrevia from '../SeccionAprobacionPrevia'
import SeccionFormularios from '../SeccionFormularios'
import SeccionFuncionarios from '../SeccionFuncionarios'
import SeccionIca from '../SeccionIca'
import SeccionPagos from '../SeccionPagos'
import SeccionProcedimiento from '../SeccionProcedimiento'
import SeccionRetencion from '../SeccionRetencion'
import SeccionSanciones from '../SeccionSanciones'
import type { FormularioConfiguracionProps } from './FormularioConfiguracion.types'

/**
 * Configuración del municipio como borrador: se valida mientras se edita y al final se guarda o se descarta.
 * Los vencimientos, su periodicidad y el pronto pago se editan aparte, en la página Calendario.
 */
export default function FormularioConfiguracion({
  config,
  editable,
}: FormularioConfiguracionProps) {
  const guardarConfiguracion = useDatos((s) => s.guardarConfiguracion)
  // Solo se configura lo que el municipio tiene activo: impuestos y RIT (los define 1cero1).
  const municipio = useDatos((s) => s.municipios.find((m) => m.id === config.municipioId))
  const impuestos = municipio?.impuestos ?? TODOS_ACTIVOS
  const conRit = municipio?.rit ?? true
  const conAprobacion = IMPUESTOS.filter((i) => impuestos[i] && municipio?.aprobacionPrevia[i])
  const [b, setB] = useState(config)
  const [guardado, setGuardado] = useState(false)
  const cambiar = (parcial: Partial<ConfigMunicipio>) => {
    setB((actual) => ({ ...actual, ...parcial }))
    setGuardado(false)
  }

  const errores = erroresConfiguracion(b)
  const cambio = JSON.stringify(b) !== JSON.stringify(config)
  const edicion = { b, cambiar, editable, errores }

  return (
    <div className="space-y-6">
      {municipio && (
        <SeccionFormularios
          {...edicion}
          formularios={formulariosDe(municipio)}
          guardados={config.formulariosDesactivados}
        />
      )}
      {(impuestos.reteica || impuestos.autorretencion) && (
        <SeccionRetencion {...edicion} impuestos={impuestos} />
      )}
      {impuestos.ica && <SeccionIca {...edicion} />}
      <SeccionProcedimiento {...edicion} conRit={conRit} />
      {recibeCheques(municipio) && <SeccionPagos {...edicion} />}
      {conAprobacion.length > 0 && (
        <SeccionAprobacionPrevia {...edicion} impuestos={conAprobacion} />
      )}
      <SeccionFuncionarios {...edicion} />
      <SeccionSanciones {...edicion} />

      {editable && (
        <BarraGuardar
          cambio={cambio}
          hayErrores={Object.keys(errores).length > 0}
          guardado={guardado}
          mensajeGuardado="Configuración guardada."
          onDescartar={() => {
            setB(config)
            setGuardado(false)
          }}
          onGuardar={() => {
            guardarConfiguracion(b)
            setGuardado(true)
          }}
        />
      )}
    </div>
  )
}
