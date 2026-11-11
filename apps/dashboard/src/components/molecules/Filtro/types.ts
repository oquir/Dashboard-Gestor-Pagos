export interface FiltroProps<T extends string> {
  etiqueta: string
  opciones: Record<T, string>
  valor: T
  cambiar: (valor: T) => void
}
