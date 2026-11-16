import {
  accountingPositionLabel,
  personTypeLabel,
  documentFormat,
  formatDate,
} from '../../../../lib'
import type { RitData, AccountingSigner } from '../../../../types'
import type { CardField } from './RitCard.types'

export const fields = (d: RitData): CardField[] => [
  ['Nombre o razón social', d.name],
  ['Tipo de persona', personTypeLabel[d.personType]],
  ['Documento', documentFormat(d)],
  ['Representante legal', d.legalRepresentative],
  ['Inicio de actividades', formatDate(d.activitiesStartDate)],
  ['Dirección', d.address],
  ['Teléfono', d.phone],
  ['Correo', d.email],
  ['Establecimientos en el municipio', String(d.establishments)],
  [
    'Régimen SIMPLE',
    d.simpleRegime
      ? 'Sí: declara su ICA consolidado ante la DIAN y no se le practica ReteICA'
      : 'No',
  ],
]

export const accountantFields = (c: AccountingSigner | undefined): CardField[] => [
  ['Firma como', c && accountingPositionLabel[c.jobTitle]],
  ['Nombre', c?.name],
  ['Documento', c && documentFormat(c)],
  ['Tarjeta profesional', c?.professionalCard],
]
