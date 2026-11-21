import type { PdfImportChoice } from '../../../../types'

// Lo que se lee bajo el nombre del archivo, antes de abrirlo.
export function choiceDetails(choice: PdfImportChoice): string[] {
  const { read } = choice
  const sheets: number = read.design.sheets.length
  const lines: string[] = [
    read.source === 'formmaker'
      ? `Diseño de FormMaker${read.version ? ` · versión ${read.version}` : ' · sin versión'}`
      : 'Plantilla hecha a mano: entra entera en la hoja 1',
    `${sheets} ${sheets === 1 ? 'hoja' : 'hojas'}`,
  ]
  if (choice.readableCount > 1) {
    lines.push(`De los ${choice.readableCount} que se pudieron leer, vale el de versión más alta.`)
  }
  return [...lines, ...read.warnings]
}
