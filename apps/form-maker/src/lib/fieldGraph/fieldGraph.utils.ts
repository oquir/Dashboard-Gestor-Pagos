import { compileScript } from '../fieldScript'

// Nombres a ids; un nombre que no resuelve se descarta (a media palabra casi nada resuelve).
export function scriptRefIds(
  source: string | undefined,
  byName: Map<string, string>,
  knownNames: Set<string>,
): string[] {
  if (!source) return []

  const ids: string[] = []

  for (const name of compileScript(source, knownNames).reads) {
    const id: string | undefined = byName.get(name)
    if (id) ids.push(id)
  }

  return ids
}
