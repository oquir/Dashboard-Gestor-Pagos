import type { MunicipalityConfig, Declaration, Summons, Registration } from '../../../../types'

/** El emplazamiento ya notificado cuando se presentó la declaración, que decide su sanción, y las tasas del municipio. */
export interface PenaltyContext {
  summons?: Summons
  penalties?: MunicipalityConfig['penalties']
}

/** Un cruce: si cumple y qué se revisó. */
export interface Validation {
  ok: boolean
  text: string
}

export interface DeclarationValidationsProps {
  d: Declaration
  reg?: Registration
  /** El municipio tiene el RIT y la validación activa en este formulario. */
  againstRit: boolean
  municipalityWithRit: boolean
  /** En una corrección, la declaración que corrige. */
  corrected?: Declaration
  penalty?: PenaltyContext
}
