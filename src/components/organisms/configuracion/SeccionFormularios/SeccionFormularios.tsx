import { etiquetaFormulario, formatoFecha, nombreCompleto } from '../../../../lib/formato'
import { useSesion } from '../../../../lib/sesion'
import type { Formulario, FormularioDesactivado } from '../../../../types'
import { hoy } from '../../../../utils'
import { Textarea } from '../../../atoms'
import { Campo, Interruptor, Seccion } from '../../../molecules'
import { AYUDA } from './constants'
import type { SeccionFormulariosProps } from './types'

/** Formularios que el municipio ofrece a los contribuyentes. Para desactivar uno hay que dar el motivo. */
export default function SeccionFormularios({ b, cambiar, editable, errores, formularios, guardados }: SeccionFormulariosProps) {
  const { usuario } = useSesion()
  const desactivados = b.formulariosDesactivados

  const fijar = (f: Formulario, desactivado: FormularioDesactivado | undefined) => {
    const siguientes = { ...desactivados, [f]: desactivado }
    if (!desactivado) delete siguientes[f]
    cambiar({ formulariosDesactivados: siguientes })
  }
  // Si se vuelve a apagar uno que ya estaba guardado como desactivado, recupera su motivo.
  const desactivar = (f: Formulario) => fijar(f, guardados[f] ?? { motivo: '', fecha: hoy(), por: usuario ? nombreCompleto(usuario) : '' })

  return (
    <Seccion
      titulo="Formularios"
      descripcion="Desactivar un formulario impide que los contribuyentes lo diligencien; lo que ya radicaron se sigue gestionando aquí. Hay que indicar el motivo."
    >
      {formularios.map((f) => {
        const d = desactivados[f]
        const guardado = guardados[f]
        return (
          <div key={f} className="space-y-3">
            <Interruptor
              etiqueta={etiquetaFormulario[f]}
              ayuda={!d ? AYUDA[f] : guardado ? `Desactivado el ${formatoFecha(guardado.fecha)} por ${guardado.por}.` : 'Se desactiva al guardar los cambios.'}
              valor={!d}
              deshabilitado={!editable}
              onChange={(activo) => (activo ? fijar(f, undefined) : desactivar(f))}
            />
            {d && (
              <Campo etiqueta="Motivo de la desactivación" error={errores[`motivo-${f}`]}>
                <Textarea
                  rows={2}
                  disabled={!editable}
                  placeholder="Ej.: se están actualizando las tarifas del año gravable."
                  value={d.motivo}
                  onChange={(e) => fijar(f, { ...d, motivo: e.target.value })}
                />
              </Campo>
            )}
          </div>
        )
      })}
    </Seccion>
  )
}
