import type { Impuesto, ResultadoOmisos, ValorFiltro } from '../../../../types'

export interface ListaOmisosProps {
  resultado: ResultadoOmisos
  /** El de la pestaña de la página; vacío, todos. */
  impuesto: ValorFiltro<Impuesto>
}

/** Un omiso no tiene emplazamiento, o lo tiene en plazo o vencido: si ya declaró, deja de ser omiso. */
export type FiltroEmplazamiento = ValorFiltro<'sin_emplazamiento' | 'en_plazo' | 'vencido'>
