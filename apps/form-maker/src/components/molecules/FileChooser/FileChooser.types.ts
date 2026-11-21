export interface FileChooserProps {
  accept: string
  multiple?: boolean
  ariaLabel: string
  // Lo que se lee al lado del boton: el archivo elegido, "Leyendo…" o que no hay ninguno.
  status: string
  onPick: (files: File[]) => void
}
