import { numero } from '../../../lib'
import { ANTICIPO_MAXIMO } from '../../../lib'
import type { EdicionConfiguracion } from '../../../types'
import { Input } from '../../atoms'
import { Campo, Interruptor, Seccion } from '../../molecules'

/** ICA anual: anticipo y sobretasa bomberil. El descuento por pronto pago está en la página Calendario. */
export default function SeccionIca({ b, cambiar, editable, errores }: EdicionConfiguracion) {
  return (
    <Seccion
      titulo="ICA anual"
      descripcion="Cobros que fija el concejo municipal. El descuento por pronto pago se pone en Calendario."
    >
      <Campo
        etiqueta="Anticipo del año siguiente (%)"
        ayuda="0 si el municipio no lo exige."
        error={errores.anticipo}
      >
        <Input
          type="number"
          min={0}
          max={ANTICIPO_MAXIMO}
          disabled={!editable}
          value={b.anticipoPorcentaje}
          onChange={(e) => cambiar({ anticipoPorcentaje: numero(e.target.value) })}
        />
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
          <div className="ml-12">
            <Campo etiqueta="Porcentaje de la sobretasa (% del ICA)" error={errores.sobretasa}>
              <Input
                type="number"
                min={0}
                step="0.1"
                disabled={!editable}
                value={b.sobretasaBomberil.porcentaje}
                onChange={(e) =>
                  cambiar({
                    sobretasaBomberil: {
                      ...b.sobretasaBomberil,
                      porcentaje: numero(e.target.value),
                    },
                  })
                }
              />
            </Campo>
          </div>
        )}
      </div>
    </Seccion>
  )
}
