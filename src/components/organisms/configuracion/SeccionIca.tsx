import { numero } from '../../../lib/configuracion'
import { ANTICIPO_MAXIMO } from '../../../lib/reglas'
import type { EdicionConfiguracion } from '../../../types'
import { Input } from '../../atoms'
import { Campo, Interruptor, Seccion } from '../../molecules'
import ProntoPago from './ProntoPago'

/** ICA anual: pronto pago, anticipo y sobretasa bomberil. */
export default function SeccionIca({ b, cambiar, editable, errores }: EdicionConfiguracion) {
  return (
    <Seccion titulo="ICA anual" descripcion="Beneficios y cobros que fija el concejo municipal.">
      <div className="space-y-3 sm:col-span-2">
        <Interruptor
          etiqueta="Descuento por pronto pago"
          ayuda="Por año gravable, en tramos según la fecha de pago. Solo sobre el impuesto neto; se pierde con pago parcial o extemporáneo."
          valor={b.prontoPago.activo}
          deshabilitado={!editable}
          onChange={(v) => cambiar({ prontoPago: { ...b.prontoPago, activo: v } })}
        />
        {b.prontoPago.activo && <ProntoPago valor={b.prontoPago} onChange={(prontoPago) => cambiar({ prontoPago })} errores={errores} editable={editable} />}
      </div>
      <Campo etiqueta="Anticipo del año siguiente (%)" ayuda="0 si el municipio no lo exige." error={errores.anticipo}>
        <Input type="number" min={0} max={ANTICIPO_MAXIMO} disabled={!editable} value={b.anticipoPorcentaje} onChange={(e) => cambiar({ anticipoPorcentaje: numero(e.target.value) })} />
      </Campo>
      <div className="space-y-3">
        <Interruptor
          etiqueta="Sobretasa bomberil"
          ayuda="Se cobra en el renglón 23 como porcentaje del impuesto de industria y comercio."
          valor={b.sobretasaBomberil.activa}
          deshabilitado={!editable}
          onChange={(v) => cambiar({ sobretasaBomberil: { ...b.sobretasaBomberil, activa: v } })}
        />
        {b.sobretasaBomberil.activa && (
          <div className="ml-7">
            <Campo etiqueta="Porcentaje de la sobretasa (% del ICA)" error={errores.sobretasa}>
              <Input type="number" min={0} step="0.1" disabled={!editable} value={b.sobretasaBomberil.porcentaje} onChange={(e) => cambiar({ sobretasaBomberil: { ...b.sobretasaBomberil, porcentaje: numero(e.target.value) } })} />
            </Campo>
          </div>
        )}
      </div>
    </Seccion>
  )
}
