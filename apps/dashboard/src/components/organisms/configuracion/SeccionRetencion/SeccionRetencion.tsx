import { numero } from '../../../../lib'
import { formatoPesos } from '../../../../lib'
import { UVT } from '../../../../lib'
import type { ConfigMunicipio } from '../../../../types'
import { Input, Select } from '../../../atoms'
import { Campo, Interruptor, Seccion } from '../../../molecules'
import type { SeccionRetencionProps } from './SeccionRetencion.types'

/** ReteICA y AutoReteICA: tarifas y bases mínimas. La periodicidad va en la página Calendario. Muestra solo lo que el municipio tiene activo. */
export default function SeccionRetencion({
  b,
  cambiar,
  editable,
  impuestos,
}: SeccionRetencionProps) {
  const titulo =
    impuestos.reteica && impuestos.autorretencion
      ? 'ReteICA y AutoReteICA'
      : impuestos.reteica
        ? 'Retención (ReteICA)'
        : 'Autorretención (AutoReteICA)'

  return (
    <Seccion
      titulo={titulo}
      descripcion="No hay formulario nacional: cada municipio define el suyo. La periodicidad y los vencimientos se ponen en Calendario."
    >
      {impuestos.reteica && (
        <>
          <Campo etiqueta="Tarifa de ReteICA">
            <Select
              disabled={!editable}
              value={b.reteica.modalidad}
              onChange={(e) =>
                cambiar({
                  reteica: {
                    ...b.reteica,
                    modalidad: e.target.value as ConfigMunicipio['reteica']['modalidad'],
                  },
                })
              }
            >
              <option value="unica">Tarifa única</option>
              <option value="actividad">Por actividad del proveedor</option>
              <option value="concepto">Por concepto (compras / servicios)</option>
            </Select>
          </Campo>
          {b.reteica.modalidad === 'unica' && (
            <Campo etiqueta="Tarifa única (por mil)">
              <Input
                type="number"
                step="0.1"
                min={0}
                disabled={!editable}
                value={b.reteica.tarifaUnicaPorMil}
                onChange={(e) =>
                  cambiar({ reteica: { ...b.reteica, tarifaUnicaPorMil: numero(e.target.value) } })
                }
              />
            </Campo>
          )}
          <Campo
            etiqueta="Base mínima de servicios (UVT)"
            ayuda={formatoPesos(b.reteica.baseMinimaServiciosUvt * UVT)}
          >
            <Input
              type="number"
              min={0}
              disabled={!editable}
              value={b.reteica.baseMinimaServiciosUvt}
              onChange={(e) =>
                cambiar({
                  reteica: { ...b.reteica, baseMinimaServiciosUvt: numero(e.target.value) },
                })
              }
            />
          </Campo>
          <Campo
            etiqueta="Base mínima de compras (UVT)"
            ayuda={formatoPesos(b.reteica.baseMinimaComprasUvt * UVT)}
          >
            <Input
              type="number"
              min={0}
              disabled={!editable}
              value={b.reteica.baseMinimaComprasUvt}
              onChange={(e) =>
                cambiar({ reteica: { ...b.reteica, baseMinimaComprasUvt: numero(e.target.value) } })
              }
            />
          </Campo>
        </>
      )}
      {impuestos.autorretencion && (
        <>
          <Campo etiqueta="Tarifa de AutoReteICA">
            <Select
              disabled={!editable}
              value={b.autorretencion.modalidad}
              onChange={(e) =>
                cambiar({
                  autorretencion: {
                    ...b.autorretencion,
                    modalidad: e.target.value as ConfigMunicipio['autorretencion']['modalidad'],
                  },
                })
              }
            >
              <option value="plena">Tarifa plena del ICA</option>
              <option value="porcentaje">Porcentaje de la tarifa</option>
            </Select>
          </Campo>
          {b.autorretencion.modalidad === 'porcentaje' && (
            <Campo etiqueta="Porcentaje de la tarifa (%)">
              <Input
                type="number"
                min={0}
                max={100}
                disabled={!editable}
                value={b.autorretencion.porcentaje}
                onChange={(e) =>
                  cambiar({
                    autorretencion: { ...b.autorretencion, porcentaje: numero(e.target.value) },
                  })
                }
              />
            </Campo>
          )}
        </>
      )}
      <Interruptor
        etiqueta="Exige declaración en ceros"
        ayuda="Si no, un agente sin retenciones en el periodo no declara y no se marca como omiso."
        valor={b.declaracionEnCeros}
        deshabilitado={!editable}
        onChange={(v) => cambiar({ declaracionEnCeros: v })}
      />
      <Interruptor
        etiqueta="Plazo de 2 meses para pagar"
        ayuda="La declaración presentada a tiempo sin pago no queda ineficaz si se paga completa dentro de los 2 meses siguientes al vencimiento (art. 580-1 del Estatuto Tributario)."
        valor={b.pagoRetencionEnDosMeses}
        deshabilitado={!editable}
        onChange={(v) => cambiar({ pagoRetencionEnDosMeses: v })}
      />
    </Seccion>
  )
}
