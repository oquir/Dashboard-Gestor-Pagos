import type { User } from '../../../../types'
import { EMAIL_PATTERN } from './UserFields.constants'
import type { UserData } from './UserFields.types'

export function userErrors(d: UserData) {
  return {
    firstNames: d.firstNames.trim() ? undefined : 'Escribe los nombres.',
    lastNames: d.lastNames.trim() ? undefined : 'Escribe los apellidos.',
    email: EMAIL_PATTERN.test(d.email.trim()) ? undefined : 'Escribe un correo válido.',
  }
}

export function hasErrors(errors: ReturnType<typeof userErrors>) {
  return Object.values(errors).some(Boolean)
}

export function dataOf(u: User, defaultMunicipality: string): UserData {
  return {
    firstNames: u.firstNames,
    lastNames: u.lastNames,
    jobTitle: u.jobTitle,
    email: u.email,
    role: u.role,
    municipalityId: u.municipalityId ?? defaultMunicipality,
  }
}
