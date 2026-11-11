import { Save } from 'reicon-react'
import { Button } from '../../atoms'
import type { SaveBarProps } from './SaveBar.types'

/** Pie fijo de un formulario en borrador: avisa si hay errores o si ya se guardó, y deja descartar o guardar. */
export default function SaveBar({
  modification,
  hasErrors,
  saved,
  savedMessage,
  onDiscard,
  onSave,
}: SaveBarProps) {
  return (
    <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {hasErrors && (
        <span className="mr-auto text-sm text-red-700">
          Corrige los campos marcados antes de guardar.
        </span>
      )}
      {saved && <span className="mr-auto text-sm text-emerald-700">{savedMessage}</span>}
      <Button variant="secondary" disabled={!modification} onClick={onDiscard}>
        Descartar cambios
      </Button>
      <Button variant="primary" disabled={!modification || hasErrors} onClick={onSave}>
        <Save className="size-4" aria-hidden /> Guardar
      </Button>
    </div>
  )
}
