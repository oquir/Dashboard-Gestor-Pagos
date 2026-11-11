import type { ApprovalSituation, CorrectionSituation } from '../lib/rules'
import type { Declaration, PaymentStatus } from './domain'

/** Lo que muestra la página Declaraciones: las presentadas o los omisos (lo que debía presentarse y no se presentó). */
export type DeclarationsView = 'filed' | 'nonFilers'

/** Fila de la tabla de declaraciones. */
export interface DeclarationRow {
  d: Declaration
  name: string
  /** NIT o cédula del contribuyente, con su tipo. */
  document: string
  /** No lo tiene la solicitud de corrección que no se ha aceptado: no se paga. */
  payment?: PaymentStatus
  /** Radicado de la declaración que corrige, si es una corrección. */
  corrects?: string
  /** La corrección baja el valor a pagar o sube el saldo a favor de la que corrige. */
  downward: boolean
  /** Solo en las correcciones a la baja que se radicaron como solicitud. */
  correction?: CorrectionSituation
  approval?: ApprovalSituation
  /** Se presentó antes de que el municipio cargara el calendario de su año gravable. */
  withoutCalendar: boolean
  /** El municipio tiene el RIT en el aplicativo, pero el contribuyente no está inscrito. */
  unregistered: boolean
}
