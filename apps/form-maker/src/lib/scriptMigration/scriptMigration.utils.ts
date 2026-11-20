import { AGGREGATE_TO_HELPER, PRECEDENCE, UNARY_PRECEDENCE } from './scriptMigration.constants'
import type { FormulaNode } from './scriptMigration.types'

// Imprime el AST como JS legible: parentesis por precedencia, no por las dudas.

// Parentesis si liga mas flojo que el padre, o igual y a la derecha (a - (b - c) no es a - b - c).
function wrap(text: string, precedence: number, parent: number, isRight: boolean): string {
  const needed: boolean = precedence < parent || (precedence === parent && isRight)

  return needed ? `(${text})` : text
}

export function printNode(node: FormulaNode, parent: number, isRight: boolean): string {
  switch (node.kind) {
    case 'number':
      return String(node.value)

    // Sintaxis de una llave: el paso 6 -> 7 la lleva despues a {{x}}.
    case 'ref':
      return `{${node.name}}`

    case 'aggregate':
      return `${AGGREGATE_TO_HELPER[node.fn] ?? node.fn}({${node.ref}})`

    // Los argumentos arrancan de cero: adentro de los parentesis de una llamada nada necesita
    // envolverse otra vez.
    case 'call':
      return `${node.callee}(${node.args.map((arg) => printNode(arg, 0, false)).join(', ')})`

    case 'unary':
      return wrap(
        `${node.operator}${printNode(node.operand, UNARY_PRECEDENCE, false)}`,
        UNARY_PRECEDENCE,
        parent,
        isRight,
      )

    case 'binary': {
      const precedence: number = PRECEDENCE[node.operator] ?? 0
      const left: string = printNode(node.left, precedence, false)
      const right: string = printNode(node.right, precedence, true)

      return wrap(`${left} ${node.operator} ${right}`, precedence, parent, isRight)
    }

    default:
      return ''
  }
}
