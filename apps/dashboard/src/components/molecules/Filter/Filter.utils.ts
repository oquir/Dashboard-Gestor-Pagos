/** Las opciones como pares valor–texto, en el orden del objeto. */
export const optionEntries = <T extends string>(options: Record<T, string>) =>
  Object.entries(options) as [T, string][]
