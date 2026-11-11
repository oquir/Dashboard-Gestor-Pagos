import { useState } from 'react'
import { etiquetaFormulario, formatoFecha, nombreCompleto } from '../../../../lib/formato'
import { useSesion } from '../../../../lib/sesion'
import type { Formulario, FormularioDesactivado } from '../../../../types'
import { hoy } from '../../../../utils'
import { Interruptor, ModalMotivo, Seccion } from '../../../molecules'
import { AYUDA } from './constants'
import type { SeccionFormulariosProps } from './types'

/** Formularios que el municipio ofrece a los contribuyentes. Para desactivar uno hay que dar el motivo en una ventana. */
export default function SeccionFormularios({
  b,
  cambiar,
  editable,
  errores,
  formularios,
  guardados,
}: SeccionFormulariosProps) {
  const { usuario } = useSesion()
  /** El formulario del que se pide el motivo: el que se está apagando o el que ya está apagado. */
  const [pidiendo, setPidiendo] = useState<Formulario | null>(null)
  const desactivados = b.formulariosDesactivados

  const fijar = (f: Formulario, desactivado: FormularioDesactivado | undefined) => {
    const siguientes = { ...desactivados, [f]: desactivado }
    if (!desactivado) delete siguientes[f]
    cambiar({ formulariosDesactivados: siguientes })
  }
  // Cambiar el motivo conserva cuándo y quién lo desactivó, y lo mismo al volver a apagar uno que estaba guardado como desactivado.
  const desactivar = (f: Formulario, motivo: string) => {
    const previo = desactivados[f] ?? guardados[f]
    fijar(
      f,
      previo
        ? { ...previo, motivo }
        : { motivo, fecha: hoy(), por: usuario ? nombreCompleto(usuario) : '' },
    )
    setPidiendo(null)
  }

  return (
    <Seccion
      titulo="Formularios"
      descripcion="Desactivar un formulario impide que los contribuyentes lo diligencien; lo que ya radicaron se sigue gestionando aquí. Hay que indicar el motivo."
    >
      {formularios.map((f) => {
        const d = desactivados[f]
        const guardado = guardados[f]
        return (
          <div key={f} className="space-y-1.5">
            <Interruptor
              etiqueta={etiquetaFormulario[f]}
              ayuda={
                !d
                  ? AYUDA[f]
                  : guardado
                    ? `Desactivado el ${formatoFecha(guardado.fecha)} por ${guardado.por}.`
                    : 'Se desactiva al guardar los cambios.'
              }
              valor={!d}
              deshabilitado={!editable}
              onChange={(activo) => (activo ? fijar(f, undefined) : setPidiendo(f))}
            />
            {d && (
              // Alineado con la etiqueta del interruptor.
              <p className="pl-12 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Motivo:</span>{' '}
                {d.motivo || <span className="text-red-600">{errores[`motivo-${f}`]}</span>}
                {editable && (
                  <button
                    type="button"
                    className="ml-2 font-medium text-brand-700 hover:underline"
                    onClick={() => setPidiendo(f)}
                  >
                    Cambiar
                  </button>
                )}
              </p>
            )}
          </div>
        )
      })}

      {pidiendo && (
        <ModalMotivo
          titulo={
            desactivados[pidiendo]
              ? 'Cambiar el motivo'
              : `Desactivar ${etiquetaFormulario[pidiendo]}`
          }
          descripcion={
            desactivados[pidiendo]
              ? `${etiquetaFormulario[pidiendo]} está desactivado.`
              : 'Los contribuyentes no podrán diligenciarlo; lo que ya radicaron se sigue gestionando aquí. Se desactiva al guardar los cambios.'
          }
          etiqueta="Motivo de la desactivación"
          placeholder="Ej.: se están actualizando las tarifas del año gravable."
          confirmar={desactivados[pidiendo] ? 'Cambiar el motivo' : 'Desactivar'}
          peligro={!desactivados[pidiendo]}
          inicial={(desactivados[pidiendo] ?? guardados[pidiendo])?.motivo}
          alConfirmar={(motivo) => desactivar(pidiendo, motivo)}
          cerrar={() => setPidiendo(null)}
        />
      )}
    </Seccion>
  )
}
