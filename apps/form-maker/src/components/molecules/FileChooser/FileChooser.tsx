import { type ChangeEvent, useRef } from 'react'
import { Button } from '../../atoms'
import type { FileChooserProps } from './FileChooser.types'

// El "Elegir archivo" de los modales de abrir (formulario y plantilla del PDF).
export function FileChooser({
  accept,
  multiple = false,
  ariaLabel,
  status,
  onPick,
}: FileChooserProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const files: File[] = [...(event.target.files ?? [])]
    // Se vacia para que volver a elegir el mismo archivo, ya corregido, dispare change otra vez.
    event.target.value = ''
    if (files.length > 0) onPick(files)
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Button
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        className="shrink-0 px-3 py-1.5 text-sm hover:cursor-pointer"
      >
        {multiple ? 'Elegir archivos' : 'Elegir archivo'}
      </Button>
      <span className="truncate text-xs text-fg-muted">{status}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        aria-label={ariaLabel}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
