// Piezas del parser, privadas al archivo que las usa.

const KEBAB_SEGMENT: RegExp = /-([a-z])/g

// Una variable CSS (--x) no se camelCasea: React necesita el nombre literal.
export function toCamelCase(property: string): string {
  if (property.startsWith('--')) return property

  return property.replace(KEBAB_SEGMENT, (_, letter: string) => letter.toUpperCase())
}

export function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '')
}

export function splitDeclarations(text: string): string[] {
  return stripComments(text)
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}
