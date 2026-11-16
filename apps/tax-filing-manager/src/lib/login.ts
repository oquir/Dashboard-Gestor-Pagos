import type { Municipality, User } from '../types'

/** Un usuario puede entrar si está activo y, de tener municipio, ese municipio también está activo. */
export function canLogIn(user: User, municipalities: Municipality[]): boolean {
  return (
    user.isActive &&
    (user.municipalityId === null ||
      municipalities.find((m) => m.id === user.municipalityId)?.isActive === true)
  )
}
