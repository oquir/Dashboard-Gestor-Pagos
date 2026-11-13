import { Save } from 'reicon-react'
import { Button } from '../../atoms'
import type { SaveBarProps } from './SaveBar.types'

/** Pie fijo de un formulario en borrador: avisa si hay errores y deja descartar o guardar. El guardado lo confirma un toast. */
export default function SaveBar({ modification, hasErrors, onDiscard, onSave }: SaveBarProps) {
  return (
    <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {hasErrors && (
        <span className="mr-auto text-sm text-danger-fg">
          Corrige los campos marcados antes de guardar.
        </span>
      )}
      <Button variant="secondary" disabled={!modification} onClick={onDiscard}>
        Descartar cambios
      </Button>
      <Button variant="primary" disabled={!modification || hasErrors} onClick={onSave}>
        <Save className="size-4" aria-hidden /> Guardar
      </Button>
    </div>
  )
}
