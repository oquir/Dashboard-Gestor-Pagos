import { formLabel, normalize, formsOf } from '../../../lib'
import type { Municipality } from '../../../types'
import { MAX_RESULTS } from './MunicipalitySearch.constants'
import type { MunicipalityOption } from './MunicipalitySearch.types'

/** Los municipios cuyo nombre contiene el texto, sin importar tildes ni mayúsculas. Primero los que empiezan por él. */
export function searchMunicipalities(municipalities: Municipality[], text: string) {
  const query = normalize(text)
  return municipalities
    .map((m) => ({ m, name: normalize(m.name) }))
    .filter((x) => x.name.includes(query))
    .sort(
      (a, b) =>
        Number(!a.name.startsWith(query)) - Number(!b.name.startsWith(query)) ||
        a.m.name.localeCompare(b.m.name, 'es'),
    )
    .map((x) => x.m)
}

/** Lo que muestra la lista para el texto escrito: sin texto, primero la opción de ver todos si va. `mas` son los que no caben. */
export function municipalityOptions(
  municipalities: Municipality[],
  text: string,
  withAll: boolean,
) {
  const found = searchMunicipalities(municipalities, text)
  const all: MunicipalityOption = {
    id: null,
    name: 'Todos los municipios',
    detail: 'Los datos de todos juntos',
    inactive: false,
  }
  const options = found.slice(0, MAX_RESULTS).map<MunicipalityOption>((m) => ({
    id: m.id,
    name: m.name,
    detail: [m.department, ...formsOf(m).map((f) => formLabel[f])].join(' · '),
    inactive: !m.isActive,
  }))
  return {
    options: withAll && !normalize(text) ? [all, ...options] : options,
    more: Math.max(found.length - MAX_RESULTS, 0),
  }
}
