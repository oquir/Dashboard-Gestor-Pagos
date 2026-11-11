/** Las opciones como pares valor–texto, en el orden del objeto. */
export const entradas = <T extends string>(opciones: Record<T, string>) => Object.entries(opciones) as [T, string][]
