import type { Bank, Municipality, MunicipalitySwitches } from '../../../../types'
import type { MunicipalityData } from '../MunicipalityFields'

/** Los interruptores guardados, como borrador. */
export function switchesOf(m: Municipality): MunicipalitySwitches {
  return {
    rit: m.rit,
    asobancariaUpload: m.asobancariaUpload,
    taxes: m.taxes,
    validateAgainstRit: m.validateAgainstRit,
    priorApproval: m.priorApproval,
    cashPayment: m.cashPayment,
    checkPayment: m.checkPayment,
    inProductionSince: m.inProductionSince,
  }
}

/** El borrador completo convertido en el municipio que se guarda (datos con trim y DV ya calculado). */
export function composeMunicipality(
  m: Municipality,
  data: MunicipalityData,
  sw: MunicipalitySwitches,
): Municipality {
  return {
    ...m,
    bank: data.bank as Bank,
    name: data.name.trim(),
    nit: data.nit.trim(),
    dv: data.dv,
    department: data.department,
    daneCode: data.daneCode.trim(),
    email: data.email.trim(),
    provider: data.provider,
    color: data.color.toLowerCase(),
    ...sw,
  }
}
