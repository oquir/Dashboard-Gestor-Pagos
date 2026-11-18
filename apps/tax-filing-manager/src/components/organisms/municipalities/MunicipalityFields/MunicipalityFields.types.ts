import type { Bank } from '../../../../types'

export interface DepartmentOption {
  id: number
  name: string
}

export interface ProviderOption {
  id: number
  label: string
  aliasUrl: string
}

export interface MunicipalityData {
  bank: Bank | ''
  name: string
  nit: string
  dv: string
  department: string
  daneCode: string
  email: string
  provider: number
  color: string
}

export interface MunicipalityFieldsProps {
  data: MunicipalityData
  change: (data: MunicipalityData) => void
  showErrors: boolean
}
