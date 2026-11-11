import { DIGITOS, NOMBRES_PERIODOS } from '../../../../constants'
import { conFecha, conPeriodicidad, conPorDigito } from '../../../../lib/calendario'
import { etiquetaPeriodicidad } from '../../../../lib/formato'
import type { Periodicidad } from '../../../../types'
import { Input, Select } from '../../../atoms'
import { Aviso, Campo, Interruptor } from '../../../molecules'
import { PERIODICIDADES_RETENCION } from './constants'
import type { TablaVencimientosProps } from './types'

/**
 * Vencimientos de un formulario en un año gravable: una fecha por periodo o, si el municipio las separa por el
 * último dígito del NIT o la cédula, una tabla con un renglón por dígito y una columna por periodo. El dígito
 * siempre es sin el de verificación (DV), y la pantalla lo dice: los municipios se confunden con eso.
 */
export default function TablaVencimientos({
  titulo,
  descripcion,
  valor,
  onChange,
  editable,
  errores,
  avisoPeriodicidad,
}: TablaVencimientosProps) {
  const nombres = NOMBRES_PERIODOS[valor.periodicidad]

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{titulo}</h3>
          <p className="text-xs text-slate-500">{descripcion}</p>
        </div>
        {valor.periodicidad !== 'anual' && (
          <Campo etiqueta="Periodicidad" ayuda="Al cambiarla, las fechas quedan vacías.">
            <Select
              disabled={!editable}
              value={valor.periodicidad}
              onChange={(e) => onChange(conPeriodicidad(valor, e.target.value as Periodicidad))}
            >
              {PERIODICIDADES_RETENCION.map((p) => (
                <option key={p} value={p}>
                  {etiquetaPeriodicidad[p]}
                </option>
              ))}
            </Select>
          </Campo>
        )}
      </div>

      {avisoPeriodicidad && (
        <Aviso tono="alerta" rol="alert">
          {avisoPeriodicidad}
        </Aviso>
      )}

      <Interruptor
        etiqueta="La fecha cambia según el último dígito del NIT o la cédula"
        ayuda="Sin el dígito de verificación (DV). Encendido, se pone una fecha para cada dígito, del 1 al 0."
        valor={valor.porDigito}
        deshabilitado={!editable}
        onChange={(v) => onChange(conPorDigito(valor, v))}
      />

      {valor.porDigito ? (
        <div className="space-y-3">
          <Aviso tono="info">
            El dígito es el último del NIT o de la cédula{' '}
            <strong>sin el dígito de verificación (DV)</strong>. Por ejemplo, en el NIT
            900.123.456-7 cuenta el 6, no el 7; en la cédula 43.567.891, el 1.
          </Aviso>
          <div className="overflow-x-auto">
            <table className="text-sm">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-2 pb-1 text-left text-xs font-medium text-slate-500"
                  >
                    Último dígito (sin DV)
                  </th>
                  {valor.periodos.map((p) => (
                    <th
                      key={p.periodo}
                      scope="col"
                      className="min-w-40 px-1 pb-1 text-left text-xs font-medium text-slate-700"
                    >
                      {nombres[p.periodo - 1]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIGITOS.map((d) => (
                  <tr key={d}>
                    <th
                      scope="row"
                      className="px-2 py-1 text-left font-medium tabular-nums text-slate-700"
                    >
                      {d}
                    </th>
                    {valor.periodos.map((p) => (
                      <td key={p.periodo} className="px-1 py-1">
                        <Input
                          type="date"
                          aria-label={`${nombres[p.periodo - 1]}, último dígito ${d}`}
                          disabled={!editable}
                          value={p.fechas[d] ?? ''}
                          onChange={(e) => onChange(conFecha(valor, p.periodo, d, e.target.value))}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {valor.periodos.some((p) => errores[p.periodo]) && (
                <tfoot>
                  <tr>
                    <td />
                    {valor.periodos.map((p) => (
                      <td key={p.periodo} className="px-1 pt-1 align-top text-xs text-red-600">
                        {errores[p.periodo]}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {valor.periodos.map((p) => (
            <Campo key={p.periodo} etiqueta={nombres[p.periodo - 1]} error={errores[p.periodo]}>
              <Input
                type="date"
                disabled={!editable}
                value={p.fechas[0] ?? ''}
                onChange={(e) => onChange(conFecha(valor, p.periodo, 0, e.target.value))}
              />
            </Campo>
          ))}
        </div>
      )}
    </div>
  )
}
