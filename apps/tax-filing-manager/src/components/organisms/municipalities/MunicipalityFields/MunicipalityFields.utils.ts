import {
  DANE_PATTERN,
  DV_PATTERN,
  EMAIL_PATTERN,
  HEX_COLOR_PATTERN,
  NIT_PATTERN,
} from '../../../../constants'
import type { Municipality } from '../../../../types'
import type { MunicipalityData } from './MunicipalityFields.types'

/** Errores por campo */
export function municipalityErrors(d: MunicipalityData) {
  return {
    bank: d.bank ? undefined : 'Selecciona un banco.',
    name: d.name.trim() ? undefined : 'Escribe el nombre del municipio.',
    nit: NIT_PATTERN.test(d.nit.trim()) ? undefined : 'Escribe el NIT sin puntos.',
    dv: d.dv && !DV_PATTERN.test(d.dv) ? 'El DV es un solo dígito (0-9).' : undefined,
    department: d.department ? undefined : 'Selecciona un departamento.',
    daneCode: DANE_PATTERN.test(d.daneCode.trim()) ? undefined : 'El código DANE tiene 5 dígitos.',
    email: EMAIL_PATTERN.test(d.email.trim()) ? undefined : 'Escribe un correo válido.',
    provider: d.provider ? undefined : 'Selecciona el proveedor.',
    color: HEX_COLOR_PATTERN.test(d.color) ? undefined : 'Escribe un color hexadecimal válido.',
  }
}

export function hasErrors(errors: ReturnType<typeof municipalityErrors>) {
  return Object.values(errors).some(Boolean)
}

export const dvOf = (nit: string) => nit.match(/\d/g)?.at(-1) ?? ''

export function dataOf(m: Municipality): MunicipalityData {
  return {
    bank: m.bank,
    name: m.name,
    nit: m.nit,
    dv: m.dv,
    department: m.department,
    daneCode: m.daneCode,
    email: m.email,
    provider: m.provider,
    color: m.color,
  }
}
