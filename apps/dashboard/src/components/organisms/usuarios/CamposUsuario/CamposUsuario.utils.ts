import type { Usuario } from '../../../../types'
import { PATRON_CORREO } from './CamposUsuario.constants'
import type { DatosUsuario } from './CamposUsuario.types'

export function erroresUsuario(d: DatosUsuario) {
  return {
    nombres: d.nombres.trim() ? undefined : 'Escribe los nombres.',
    apellidos: d.apellidos.trim() ? undefined : 'Escribe los apellidos.',
    correo: PATRON_CORREO.test(d.correo.trim()) ? undefined : 'Escribe un correo válido.',
  }
}

export function hayErrores(errores: ReturnType<typeof erroresUsuario>) {
  return Object.values(errores).some(Boolean)
}

export function datosDe(u: Usuario, municipioPorDefecto: string): DatosUsuario {
  return {
    nombres: u.nombres,
    apellidos: u.apellidos,
    cargo: u.cargo,
    correo: u.correo,
    rol: u.rol,
    municipioId: u.municipioId ?? municipioPorDefecto,
  }
}
