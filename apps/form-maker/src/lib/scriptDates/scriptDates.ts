import { DATE_HELPER_NAMES, toScriptNumber } from '../../constants'
import type { ScriptFunction } from '../../types'
import type { RuntimeContext } from '../../types'
import { buscarFechaLimite, diasEntre, mesesOFraccion } from '../maxDates'

// Helpers de fecha del script: impuros (la tabla de vencimientos no esta en el export), se arman
// por corrida. Contrato: compiled los llama por nombre.

const PERIODO_POR_DEFECTO: number = 1

function comoTexto(valor: unknown): string {
  return valor === undefined || valor === null ? '' : String(valor)
}

// El periodo cae en 1 cuando no lo pasan o llega vacio, que es el caso de toda declaracion anual.
function comoPeriodo(valor: unknown): number {
  const numero: number = toScriptNumber(valor)

  return numero > 0 ? numero : PERIODO_POR_DEFECTO
}

function resolver(context: RuntimeContext, args: unknown[]): string | null {
  const anio: number = toScriptNumber(args[0])
  if (anio <= 0) return null

  return buscarFechaLimite(context.reglas, anio, comoPeriodo(args[1]), comoTexto(args[2])) ?? null
}

// El orden sale de DATE_HELPER_NAMES: escribirlo dos veces podria correr los argumentos sin aviso.
export function buildDateHelpers(context: RuntimeContext): ScriptFunction[] {
  const porNombre: Record<string, ScriptFunction> = {
    // La fecha maxima, o null si no hay tabla para ese ano, periodo o digito.
    fechaLimite: (...args: unknown[]) => resolver(context, args),

    // 0 tambien sin fecha para comparar, a proposito: NaN apagaria la cadena de renglones, y una
    // sancion no nace de un dato que falta.
    diasDeMora: (...args: unknown[]) => {
      const limite: string | null = resolver(context, args)
      if (limite === null) return 0

      const dias: number | null = diasEntre(limite, context.hoy)

      return dias === null || dias <= 0 ? 0 : dias
    },

    // Meses o fraccion (no dias / 30, que cobra un mes de mas). Sin tabla no hay mora.
    mesesDeMora: (...args: unknown[]) => {
      const limite: string | null = resolver(context, args)
      if (limite === null) return 0

      const meses: number | null = mesesOFraccion(limite, context.hoy)

      return meses === null || meses <= 0 ? 0 : meses
    },
  }

  return DATE_HELPER_NAMES.map((name) => porNombre[name])
}
