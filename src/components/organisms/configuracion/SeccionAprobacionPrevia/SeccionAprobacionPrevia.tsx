import { numero } from '../../../../lib/configuracion'
import { etiquetaImpuesto } from '../../../../lib/formato'
import type { ConfigMunicipio } from '../../../../types'
import { Input, Select } from '../../../atoms'
import { Campo, Seccion } from '../../../molecules'
import type { SeccionAprobacionPreviaProps } from './types'

/** Plazos de la aprobación previa en los formularios donde 1cero1 la activó. */
export default function SeccionAprobacionPrevia({ b, cambiar, editable, errores, impuestos }: SeccionAprobacionPreviaProps) {
  const aprobacion = b.aprobacionPrevia

  return (
    <Seccion
      titulo="Aprobación previa"
      descripcion={`Activa en ${impuestos.map((i) => etiquetaImpuesto[i]).join(', ')} (la activa 1cero1). El contribuyente paga cuando el municipio aprueba; descuento, sanciones e intereses se liquidan con la fecha de radicación.`}
    >
      <Campo etiqueta="Plazo para aprobar (días hábiles)" ayuda="Cuenta desde la radicación. Si se radicó a tiempo, no pasa del vencimiento." error={errores.plazoAprobacion}>
        <Input type="number" min={1} disabled={!editable} value={aprobacion.plazoDiasHabiles} onChange={(e) => cambiar({ aprobacionPrevia: { ...aprobacion, plazoDiasHabiles: numero(e.target.value) } })} />
      </Campo>
      <Campo etiqueta="Si se vence el plazo sin revisión">
        <Select disabled={!editable} value={aprobacion.alVencer} onChange={(e) => cambiar({ aprobacionPrevia: { ...aprobacion, alVencer: e.target.value as ConfigMunicipio['aprobacionPrevia']['alVencer'] } })}>
          <option value="aprobar">Se aprueba automáticamente y se envía el correo</option>
          <option value="alertar">Sigue por aprobar y se alerta como vencida</option>
        </Select>
      </Campo>
      <Campo
        etiqueta="Vigencia del recibo (días hábiles)"
        ayuda="Desde la aprobación. Si paga dentro de este plazo, conserva las condiciones de la radicación, como el descuento por pronto pago."
        error={errores.vigenciaRecibo}
      >
        <Input type="number" min={1} disabled={!editable} value={aprobacion.vigenciaReciboDiasHabiles} onChange={(e) => cambiar({ aprobacionPrevia: { ...aprobacion, vigenciaReciboDiasHabiles: numero(e.target.value) } })} />
      </Campo>
    </Seccion>
  )
}
