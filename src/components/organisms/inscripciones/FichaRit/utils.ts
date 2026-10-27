import { etiquetaTipoPersona, formatoDocumento, formatoFecha } from '../../../../lib/formato'
import type { DatosRit } from '../../../../types'
import type { CampoFicha } from './types'

export const campos = (d: DatosRit): CampoFicha[] => [
  ['Nombre o razón social', d.nombre],
  ['Tipo de persona', etiquetaTipoPersona[d.tipoPersona]],
  ['Documento', formatoDocumento(d)],
  ['Representante legal', d.representanteLegal],
  ['Inicio de actividades', formatoFecha(d.fechaInicioActividades)],
  ['Dirección', d.direccion],
  ['Teléfono', d.telefono],
  ['Correo', d.correo],
  ['Régimen SIMPLE', d.regimenSimple ? 'Sí: declara su ICA consolidado ante la DIAN y no se le practica ReteICA' : 'No'],
]
