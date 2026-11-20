import type { ScriptRef } from '../../types/fieldScript'
import { fieldRefText, findScriptRefs } from '../fieldScript/fieldScript'
import { LEGACY_REF_PATTERN } from './scriptMigration.constants'
import { parseFormula } from './scriptMigration.parser'
import type { FormulaNode } from './scriptMigration.types'
import { printNode } from './scriptMigration.utils'

// Traducciones de formatos viejos: formulas (antes de la v3) y referencias de una llave (antes de
// la v7). Si ya no hay borradores viejos, se borra la carpeta.

// null si no parsea: la migracion la conserva como comentario.
export function formulaToScript(formula: string): string | null {
  const ast: FormulaNode | null = parseFormula(formula)
  if (ast === null) return null

  return `return ${printNode(ast, 0, false)};`
}

// {campo} a {{campo}} solo donde el compilador viejo sustituia (campo conocido, en codigo): compila
// al mismo cuerpo.
export function upgradeFieldRefs(source: string, knownNames: Set<string>): string {
  const refs: ScriptRef[] = findScriptRefs(source, knownNames, LEGACY_REF_PATTERN).filter(
    (ref) => ref.known,
  )

  // De atras hacia adelante: cada reemplazo es mas largo y correria las posiciones.
  let upgraded: string = source
  for (const ref of [...refs].reverse()) {
    upgraded = `${upgraded.slice(0, ref.start)}${fieldRefText(ref.name)}${upgraded.slice(ref.end)}`
  }

  return upgraded
}
