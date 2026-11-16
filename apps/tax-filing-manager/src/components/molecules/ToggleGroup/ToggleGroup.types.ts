export interface ToggleOption {
  /** Texto corto del botón. */
  text: string
  /** Lo que filtra, completo: sale en un globo al pasar el mouse. */
  title: string
  isActive: boolean
  change: (isActive: boolean) => void
}

export interface ToggleGroupProps {
  label: string
  options: ToggleOption[]
  className?: string
}
