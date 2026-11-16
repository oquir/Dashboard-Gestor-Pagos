import { DocumentUpload } from 'reicon-react'
import type { FilePickerProps } from './FilePicker.types'

/** Botón punteado que abre el selector de archivos del sistema. */
export default function FilePicker({
  text,
  icon: IconComponent = DocumentUpload,
  ...props
}: FilePickerProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-border-strong bg-surface px-3 py-2 text-sm text-fg focus-within:ring-2 focus-within:ring-brand-border hover:border-brand-border hover:text-brand-fg">
      <IconComponent className="size-4" aria-hidden /> {text}
      <input type="file" className="sr-only" {...props} />
    </label>
  )
}
