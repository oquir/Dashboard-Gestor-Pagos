import { etiquetaCalidad, etiquetaEstadoInscripcion, etiquetaTipoNovedad, etiquetaTipoPersona } from '../../lib/formato'
import type { Calidad, EstadoInscripcion, TipoNovedad, TipoPersona, ValorFiltro } from '../../types'

/** Las calidades, en el orden de los indicadores. */
export const CALIDADES: Calidad[] = ['contribuyente', 'agente_retenedor', 'autorretenedor']

export const PLURAL: Record<Calidad, string> = {
  contribuyente: 'Contribuyentes',
  agente_retenedor: 'Agentes retenedores',
  autorretenedor: 'Autorretenedores',
}

export const OPCIONES_TIPO_PERSONA: Record<ValorFiltro<TipoPersona>, string> = { '': 'Todo tipo de persona', ...etiquetaTipoPersona }
export const OPCIONES_CALIDAD: Record<ValorFiltro<Calidad>, string> = { '': 'Toda calidad', ...etiquetaCalidad }
export const OPCIONES_ESTADO: Record<ValorFiltro<EstadoInscripcion>, string> = { '': 'Todo estado', ...etiquetaEstadoInscripcion }
export const OPCIONES_TRAMITE: Record<ValorFiltro<TipoNovedad>, string> = { '': 'Todo trámite', ...etiquetaTipoNovedad }
