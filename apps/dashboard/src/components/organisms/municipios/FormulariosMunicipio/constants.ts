import type { GrupoOpciones } from './types'

/** Columnas de la matriz, agrupadas por para qué sirven. */
export const GRUPOS: GrupoOpciones[] = [
  {
    titulo: 'Revisión',
    opciones: [
      { clave: 'validarContraRit', texto: 'Contra el RIT' },
      { clave: 'aprobacionPrevia', texto: 'Aprobación previa' },
    ],
  },
  {
    titulo: 'Ventanilla',
    opciones: [
      { clave: 'pagoEfectivo', texto: 'Efectivo' },
      { clave: 'pagoCheque', texto: 'Cheque de gerencia' },
    ],
  },
]

export const LEYENDA = [
  { termino: 'Gestiona', definicion: 'El municipio tiene el formulario en el aplicativo. La primera vez que se activa se pone su fecha de salida a producción, que no se puede cambiar.' },
  { termino: 'Contra el RIT', definicion: 'Antes de diligenciarlo se validan los datos del contribuyente contra el RIT. Requiere el RIT en el aplicativo.' },
  { termino: 'Aprobación previa', definicion: 'El contribuyente paga cuando el municipio aprueba. Aplica a lo que se radique desde que se activa.' },
  { termino: 'Efectivo y cheque de gerencia', definicion: 'Se reciben en la ventanilla del municipio. El cheque cuenta como pago cuando se confirma que el banco lo pagó.' },
]
