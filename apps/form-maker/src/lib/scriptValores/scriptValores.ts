import { toScriptNumber, VALUE_HELPER_NAMES } from '../../constants'
import type { ScriptFunction } from '../../types'
import type { RuntimeContext } from '../../types'
import type { ValorAnual } from '../../types'
import { anioDeTexto, buscarValores } from '../valoresAnuales'

// Helpers de UVT y SMMLV: impuros como los de fecha (la tabla no viaja en el export), se arman por
// corrida. Contrato: compiled los llama por nombre.

// Sin ano, el de hoy: la sancion se liquida con la UVT del ano en que se liquida.
function anioPedido(context: RuntimeContext, args: unknown[]): number {
  const pedido: number = toScriptNumber(args[0])

  return pedido > 0 ? pedido : anioDeTexto(context.hoy)
}

// null y no 0: un 0 borraria en silencio la sancion minima. El autor pone su respaldo: uvt() ??
// 52374.
function resolver(
  context: RuntimeContext,
  args: unknown[],
  columna: 'uvt' | 'smmlv',
): number | null {
  // Un contexto armado por una version vieja del consumidor puede no traer valores.
  const tabla: ValorAnual[] = Array.isArray(context.valores) ? context.valores : []
  const fila: ValorAnual | null = buscarValores(tabla, anioPedido(context, args))

  return fila === null ? null : fila[columna]
}

// El orden sale de VALUE_HELPER_NAMES, como en buildDateHelpers.
export function buildValueHelpers(context: RuntimeContext): ScriptFunction[] {
  const porNombre: Record<string, ScriptFunction> = {
    // UVT del ano pedido, o del ano en curso si no se pasa ninguno.
    uvt: (...args: unknown[]) => resolver(context, args, 'uvt'),

    // Salario minimo mensual legal vigente, con la misma regla.
    smmlv: (...args: unknown[]) => resolver(context, args, 'smmlv'),
  }

  return VALUE_HELPER_NAMES.map((name) => porNombre[name])
}
