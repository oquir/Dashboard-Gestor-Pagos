import { useMemo } from 'react'
import { useDatos } from '../store'
import type { Impuesto, Municipio } from '../types'

export const IMPUESTOS: Impuesto[] = ['ica', 'reteica', 'autorretencion']

/**
 * Usuario en sesión y municipio que está viendo. Los roles municipales solo ven
 * el suyo; 1cero1 ve el que elija en la barra superior (null = todos).
 */
export function useSesion() {
  const usuarioId = useDatos((s) => s.usuarioId)
  const usuarios = useDatos((s) => s.usuarios)
  const municipioSeleccionado = useDatos((s) => s.municipioSeleccionado)
  const usuario = usuarios.find((u) => u.id === usuarioId) ?? null
  const municipioId = usuario?.rol === '1cero1' ? municipioSeleccionado : (usuario?.municipioId ?? null)
  return { usuario, municipioId }
}

export const delMunicipio = <T extends { municipioId: string | null }>(lista: T[], municipioId: string | null) =>
  municipioId === null ? lista : lista.filter((item) => item.municipioId === municipioId)

/** Filtro: el municipio del registro tiene activo ese impuesto. */
export function impuestoActivo(municipios: Municipio[]) {
  const porId = new Map(municipios.map((m) => [m.id, m.impuestos]))
  return (item: { municipioId: string; impuesto: Impuesto }) => porId.get(item.municipioId)?.[item.impuesto] ?? false
}

/** Impuestos que se ven: los del municipio elegido, o los de cualquiera cuando 1cero1 mira todos. */
export const impuestosVisibles = (municipios: Municipio[], municipioId: string | null) =>
  IMPUESTOS.filter((i) => municipios.some((m) => (municipioId === null || m.id === municipioId) && m.impuestos[i]))

/** El RIT se ve si el municipio elegido lo tiene activo, o si alguno lo tiene cuando 1cero1 mira todos. */
export const ritVisible = (municipios: Municipio[], municipioId: string | null) =>
  municipios.some((m) => (municipioId === null || m.id === municipioId) && m.rit)

/** Filtro: el municipio del registro tiene el RIT en el aplicativo. */
export function conRit(municipios: Municipio[]) {
  const ids = new Set(municipios.filter((m) => m.rit).map((m) => m.id))
  return (item: { municipioId: string }) => ids.has(item.municipioId)
}

/** Si la declaración se valida contra el RIT: el municipio tiene el RIT y la validación activa en ese formulario. */
export function seValidaContraRit(municipios: Municipio[], d: { municipioId: string; impuesto: Impuesto }) {
  const m = municipios.find((x) => x.id === d.municipioId)
  return Boolean(m?.rit && m.validarContraRit[d.impuesto])
}

/** Declaraciones del municipio que se está viendo, solo de los impuestos que tiene activos. */
export function useDeclaraciones() {
  const { municipioId } = useSesion()
  const declaraciones = useDatos((s) => s.declaraciones)
  const municipios = useDatos((s) => s.municipios)
  return useMemo(() => delMunicipio(declaraciones, municipioId).filter(impuestoActivo(municipios)), [declaraciones, municipios, municipioId])
}
