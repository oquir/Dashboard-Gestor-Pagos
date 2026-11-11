import { Save } from 'reicon-react'
import { Boton } from '../../atoms'
import type { BarraGuardarProps } from './types'

/** Pie fijo de un formulario en borrador: avisa si hay errores o si ya se guardó, y deja descartar o guardar. */
export default function BarraGuardar({
  cambio,
  hayErrores,
  guardado,
  mensajeGuardado,
  onDescartar,
  onGuardar,
}: BarraGuardarProps) {
  return (
    <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {hayErrores && (
        <span className="mr-auto text-sm text-red-700">
          Corrige los campos marcados antes de guardar.
        </span>
      )}
      {guardado && <span className="mr-auto text-sm text-emerald-700">{mensajeGuardado}</span>}
      <Boton variante="secundario" disabled={!cambio} onClick={onDescartar}>
        Descartar cambios
      </Boton>
      <Boton variante="primario" disabled={!cambio || hayErrores} onClick={onGuardar}>
        <Save className="size-4" aria-hidden /> Guardar
      </Boton>
    </div>
  )
}
