import type { ConfigMunicipio } from '../../../../types'

export interface ProntoPagoProps {
  valor: ConfigMunicipio['prontoPago']
  onChange: (valor: ConfigMunicipio['prontoPago']) => void
  errores: Record<string, string>
  editable: boolean
}
