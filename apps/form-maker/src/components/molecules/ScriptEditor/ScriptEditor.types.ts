export interface ScriptEditorProps {
  // Va al div editable, para que la etiqueta apunte a algo enfocable.
  id: string
  ariaLabel: string
  value: string
  // Nombres validos de {{campo}}: pintado, autocompletado y error.
  knownNames: Set<string>
  placeholder?: string
  minHeight?: string
  maxHeight?: string
  onChange: (value: string) => void
}
