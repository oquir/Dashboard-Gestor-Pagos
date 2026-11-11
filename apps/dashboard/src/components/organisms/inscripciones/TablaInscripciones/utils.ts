import { ayudanteColumnas } from '../../../../lib/tabla'
import type { Inscripcion, Municipio } from '../../../../types'

export const col = ayudanteColumnas<Inscripcion>()

export const columnaMunicipio = (municipios: Municipio[]) =>
  col.accessor((i) => municipios.find((m) => m.id === i.municipioId)?.nombre ?? '', {
    id: 'municipio',
    header: 'Municipio',
    meta: { clase: 'whitespace-nowrap text-slate-700' },
  })
