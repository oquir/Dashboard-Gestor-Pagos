import { ayudanteColumnas } from '../../../../lib/tabla'
import type { Municipio, Omiso } from '../../../../types'

export const col = ayudanteColumnas<Omiso>()

export const columnaMunicipio = (municipios: Municipio[]) =>
  col.accessor((o) => municipios.find((m) => m.id === o.inscripcion.municipioId)?.nombre ?? '', {
    id: 'municipio',
    header: 'Municipio',
    meta: { clase: 'whitespace-nowrap text-slate-700' },
  })
