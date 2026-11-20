export interface ScriptInputProps {
  id: string
  label: string
  value: string
  rows?: number
  maxRows?: number
  // Nombres validos de {{campo}}.
  knownNames: Set<string>
  placeholder?: string
  onChange: (value: string) => void
}
