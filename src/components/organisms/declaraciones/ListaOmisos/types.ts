import type { Impuesto, ResultadoOmisos, ValorFiltro } from '../../../../types'

export interface ListaOmisosProps {
  resultado: ResultadoOmisos
  /** El de la pestaña de la página; vacío, todos. */
  impuesto: ValorFiltro<Impuesto>
}
