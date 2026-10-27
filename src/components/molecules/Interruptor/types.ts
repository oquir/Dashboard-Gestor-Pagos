export interface InterruptorProps {
  etiqueta: string
  ayuda?: string
  valor: boolean
  onChange: (valor: boolean) => void
  deshabilitado?: boolean
}
