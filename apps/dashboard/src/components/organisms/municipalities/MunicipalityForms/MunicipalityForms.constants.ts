import type { OptionGroup } from './MunicipalityForms.types'

/** Columnas de la matriz, agrupadas por para qué sirven. */
export const GROUPS: OptionGroup[] = [
  {
    title: 'Revisión',
    options: [
      { key: 'validateAgainstRit', text: 'Contra el RIT' },
      { key: 'priorApproval', text: 'Aprobación previa' },
    ],
  },
  {
    title: 'Ventanilla',
    options: [
      { key: 'cashPayment', text: 'Efectivo' },
      { key: 'checkPayment', text: 'Cheque de gerencia' },
    ],
  },
]

export const LEGEND = [
  {
    searchTerm: 'Gestiona',
    definition:
      'El municipio tiene el formulario en el aplicativo. La primera vez que se activa se pone su fecha de salida a producción, que no se puede cambiar.',
  },
  {
    searchTerm: 'Contra el RIT',
    definition:
      'Antes de diligenciarlo se validan los datos del contribuyente contra el RIT. Requiere el RIT en el aplicativo.',
  },
  {
    searchTerm: 'Aprobación previa',
    definition:
      'El contribuyente paga cuando el municipio aprueba. Aplica a lo que se radique desde que se activa.',
  },
  {
    searchTerm: 'Efectivo y cheque de gerencia',
    definition:
      'Se reciben en la ventanilla del municipio. El cheque cuenta como pago cuando se confirma que el banco lo pagó.',
  },
]
