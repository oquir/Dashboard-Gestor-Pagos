import type { CatalogOption } from '../../../../types'

export function optionText(option: CatalogOption): string {
  return option.code ? `${option.code} · ${option.label}` : option.label
}

// El simbolo por mil se lee como porcentaje en pantalla.
export function formatTarifa(tarifa: number): string {
  return `${tarifa}X1000`
}
