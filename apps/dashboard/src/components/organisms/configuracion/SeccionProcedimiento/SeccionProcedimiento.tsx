import { numero } from '../../../../lib/configuracion'
import type { ConfigMunicipio } from '../../../../types'
import { Input, Select } from '../../../atoms'
import { Campo, Interruptor, Seccion } from '../../../molecules'
import type { SeccionProcedimientoProps } from './types'

/** Corrección a la baja y, si el municipio tiene el RIT en el aplicativo, sus plazos y su cancelación. */
export default function SeccionProcedimiento({
  b,
  cambiar,
  editable,
  conRit,
}: SeccionProcedimientoProps) {
  return (
    <Seccion titulo={conRit ? 'Procedimiento y RIT' : 'Procedimiento'}>
      <Campo
        etiqueta="Corrección a la baja"
        ayuda="Directa: el contribuyente presenta la corrección dentro del año siguiente al vencimiento y reemplaza a la anterior. Con solicitud: el municipio tiene 6 meses para aceptarla o rechazarla, y si no responde, se acepta sola. Aplica a lo que se radique desde el cambio."
      >
        <Select
          disabled={!editable}
          value={b.correccionABaja}
          onChange={(e) =>
            cambiar({ correccionABaja: e.target.value as ConfigMunicipio['correccionABaja'] })
          }
        >
          <option value="correccion_directa">
            Corrección directa (art. 589 vigente, Ley 1819 de 2016)
          </option>
          <option value="proyecto_589">
            Solicitud con proyecto de corrección (art. 589 anterior)
          </option>
        </Select>
      </Campo>
      {conRit && (
        <>
          <Campo etiqueta="Plazo para inscribirse en el RIT (meses desde el inicio de actividades)">
            <Input
              type="number"
              min={0}
              disabled={!editable}
              value={b.plazoInscripcionMeses}
              onChange={(e) => cambiar({ plazoInscripcionMeses: numero(e.target.value) })}
            />
          </Campo>
          <Interruptor
            etiqueta="Cancelación automática del RIT"
            ayuda="Si está apagado, la administración verifica el cese antes de aprobar la cancelación."
            valor={b.cancelacionRitAutomatica}
            deshabilitado={!editable}
            onChange={(v) => cambiar({ cancelacionRitAutomatica: v })}
          />
        </>
      )}
    </Seccion>
  )
}
