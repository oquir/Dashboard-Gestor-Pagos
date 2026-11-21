import type { CatalogBank, CatalogEntry, CatalogSource } from './catalog'
import type { FechasMaximasPresentacion, MaxDatesSource, StoredMaxDates } from './maxDates'
import type { StoredValores, ValorAnual, ValoresSource } from './valores'

// Bancos del simulador (catalogos, fechas maximas, UVT/SMMLV). Fuera del borrador y del export, cada
// uno en su clave de localStorage, compartidos entre formularios.
export interface BanksSlice {
  catalogBank: CatalogBank
  maxDates: StoredMaxDates
  valores: StoredValores
  setCatalogEntries: (catalogId: string, entries: CatalogEntry[]) => void
  setCatalogSource: (catalogId: string, source: CatalogSource) => void
  clearCatalogEntries: (catalogId: string) => void
  // null vuelve a la tabla generada. Recibe la tabla armada: la aritmetica vive en lib/maxDates.
  setMaxDates: (fechas: FechasMaximasPresentacion | null) => void
  setMaxDatesSource: (source: MaxDatesSource) => void
  // null vuelve a la tabla de fabrica.
  setValores: (valores: ValorAnual[] | null) => void
  setValoresSource: (source: ValoresSource) => void
}
