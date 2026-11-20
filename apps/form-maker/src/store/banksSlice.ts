import type { StoreApi } from 'zustand'
import { loadCatalogBank, saveCatalogBank } from '../lib'
import { loadMaxDates, saveMaxDates } from '../lib'
import { loadValores, saveValores } from '../lib'
import type { BanksSlice } from '../types'
import type { CatalogBank } from '../types'
import type { FormState } from '../types'
import type { StoredMaxDates } from '../types'
import type { StoredValores } from '../types'

// Los tres bancos del simulador: no tocan el lienzo ni entran al borrador o al export. Se mezclan
// con spread en formStore, asi que se leen con el mismo useFormStore. Cada accion guarda tambien en
// localStorage: sobreviven a descartar un borrador. Recibe solo set: ninguna accion lee el estado
// fuera de su callback.
export function createBanksSlice(set: StoreApi<FormState>['setState']): BanksSlice {
  return {
    catalogBank: loadCatalogBank(),
    maxDates: loadMaxDates(),
    valores: loadValores(),
    setCatalogEntries: (catalogId, entries) =>
      set((state) => {
        const catalogBank: CatalogBank = {
          ...state.catalogBank,
          [catalogId]: { source: 'custom', entries },
        }
        saveCatalogBank(catalogBank)

        return { catalogBank }
      }),
    // Cambiar de origen conserva lo cargado: volver no obliga a pegarlo de nuevo.
    setCatalogSource: (catalogId, source) =>
      set((state) => {
        const stored = state.catalogBank[catalogId]
        if (!stored) return state

        const catalogBank: CatalogBank = {
          ...state.catalogBank,
          [catalogId]: { ...stored, source },
        }
        saveCatalogBank(catalogBank)

        return { catalogBank }
      }),
    clearCatalogEntries: (catalogId) =>
      set((state) => {
        const catalogBank: CatalogBank = { ...state.catalogBank }
        delete catalogBank[catalogId]
        saveCatalogBank(catalogBank)

        return { catalogBank }
      }),
    // Cargar una tabla la deja en uso.
    setMaxDates: (fechas) =>
      set((state) => {
        const maxDates: StoredMaxDates =
          fechas === null
            ? { ...state.maxDates, source: 'default' }
            : { source: 'custom', custom: fechas }
        saveMaxDates(maxDates)

        return { maxDates }
      }),
    // Vuelve a la generada sin tirar lo cargado.
    setMaxDatesSource: (source) =>
      set((state) => {
        const maxDates: StoredMaxDates = { ...state.maxDates, source }
        saveMaxDates(maxDates)

        return { maxDates }
      }),
    // Cargar una tabla la deja en uso, como las fechas.
    setValores: (lista) =>
      set((state) => {
        const valores: StoredValores =
          lista === null
            ? { ...state.valores, source: 'default' }
            : { source: 'custom', custom: lista }
        saveValores(valores)

        return { valores }
      }),
    setValoresSource: (source) =>
      set((state) => {
        const valores: StoredValores = { ...state.valores, source }
        saveValores(valores)

        return { valores }
      }),
  }
}
