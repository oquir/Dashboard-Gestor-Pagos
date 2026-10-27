import { useMemo } from 'react'
import { useDatos } from '../store'
import type { Declaracion, Formulario, Impuesto, MediosVentanilla, Municipio } from '../types'
import { aprobacionDe } from './reglas'

export const IMPUESTOS: Impuesto[] = ['ica', 'reteica', 'autorretencion']

/** Formularios que 1cero1 tiene activos en el municipio: el RIT y los de sus impuestos. */
export const formulariosDe = (m: Municipio): Formulario[] => [...(m.rit ? ['rit' as const] : []), ...IMPUESTOS.filter((i) => m.impuestos[i])]

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

/**
 * Si el usuario ve lo recaudado por el municipio. El administrador decide en Configuración
 * si los funcionarios lo ven; si no hay configuración, no lo ven.
 */
export function useVerRecaudo() {
  const { usuario, municipioId } = useSesion()
  const configuraciones = useDatos((s) => s.configuraciones)
  const ocultar = configuraciones.find((c) => c.municipioId === municipioId)?.ocultarRecaudoAFuncionarios ?? true
  return usuario?.rol !== 'funcionario' || !ocultar
}

export const delMunicipio =<T extends { municipioId: string | null }>(lista: T[], municipioId: string | null) =>
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

/** La aprobación previa se ve si algún formulario activo del municipio elegido la tiene, o de cualquiera cuando 1cero1 mira todos. */
export const aprobacionVisible = (municipios: Municipio[], municipioId: string | null) =>
  municipios.some((m) => (municipioId === null || m.id === municipioId) && IMPUESTOS.some((i) => m.impuestos[i] && m.aprobacionPrevia[i]))

/** La carga del Asobancaria 2001 se ve si el municipio elegido la tiene, o si alguno la tiene cuando 1cero1 mira todos. */
export const cargaAsobancariaVisible = (municipios: Municipio[], municipioId: string | null) =>
  municipios.some((m) => (municipioId === null || m.id === municipioId) && m.cargaAsobancaria)

/** Medios que el municipio recibe en su ventanilla para el formulario de ese impuesto. */
export const ventanillaDe = (m: Municipio | undefined, impuesto: Impuesto): MediosVentanilla => ({
  efectivo: Boolean(m?.pagoEfectivo[impuesto]),
  cheque: Boolean(m?.pagoCheque[impuesto]),
})

/** El municipio recibe cheques de gerencia en alguno de sus formularios activos. */
export const recibeCheques = (m: Municipio | undefined) => IMPUESTOS.some((i) => m?.impuestos[i] && m.pagoCheque[i])

/** Los cheques se ven si el municipio elegido los recibe, o si alguno los recibe cuando 1cero1 mira todos. */
export const chequesVisibles = (municipios: Municipio[], municipioId: string | null) =>
  municipios.some((m) => (municipioId === null || m.id === municipioId) && recibeCheques(m))

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

/** Aprobación previa de cada declaración al día de hoy, según la configuración de su municipio. */
export function useAprobacion() {
  const configuraciones = useDatos((s) => s.configuraciones)
  return useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10)
    const porMunicipio = new Map(configuraciones.map((c) => [c.municipioId, c]))
    return (d: Declaracion) => {
      const cfg = porMunicipio.get(d.municipioId)
      return cfg && aprobacionDe(d, cfg, hoy)
    }
  }, [configuraciones])
}
