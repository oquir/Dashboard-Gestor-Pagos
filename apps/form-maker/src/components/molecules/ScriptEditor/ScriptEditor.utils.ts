import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import type { Diagnostic } from '@codemirror/lint'
import { RangeSetBuilder } from '@codemirror/state'
import type { DecorationSet, EditorView, ViewUpdate } from '@codemirror/view'
import { Decoration, ViewPlugin } from '@codemirror/view'
import { SCRIPT_CONTEXT_PARAMS, SCRIPT_HELPER_NAMES } from '../../../constants/fieldScript'
import {
  compileScript,
  fieldRefText,
  unknownRefsMessage,
} from '../../../lib/fieldScript/fieldScript'
import type { ScriptRef } from '../../../types/fieldScript'

// Las extensiones leen los nombres con un getter: se crean una sola vez, y recrearlas tiraria
// cursor, historial y desplegable.

const KNOWN_MARK = Decoration.mark({ class: 'cm-field-ref' })
const UNKNOWN_MARK = Decoration.mark({ class: 'cm-field-ref-unknown' })

function scriptRefs(source: string, knownNames: Set<string>): ScriptRef[] {
  return compileScript(source, knownNames).refs
}

function buildDecorations(view: EditorView, knownNames: Set<string>): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()

  // En orden de documento, como exige RangeSetBuilder (desordenado lanza).
  for (const ref of scriptRefs(view.state.doc.toString(), knownNames)) {
    builder.add(ref.start, ref.end, ref.known ? KNOWN_MARK : UNKNOWN_MARK)
  }

  return builder.finish()
}

export function fieldRefHighlighter(getKnownNames: () => Set<string>) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = buildDecorations(view, getKnownNames())
      }

      update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = buildDecorations(update.view, getKnownNames())
        }
      }
    },
    { decorations: (plugin) => plugin.decorations },
  )
}

// Cierra las llaves que falten: con el autocierre, "{{" ya deja "}}" despues del cursor.
function applyFieldRef(name: string) {
  return (view: EditorView, _completion: Completion, from: number, to: number): void => {
    const after: string = view.state.doc.sliceString(to, to + 2)
    const closing: string = after === '}}' ? '' : after.startsWith('}') ? '}' : '}}'

    view.dispatch({
      changes: { from, to, insert: `${name}${closing}` },
      selection: { anchor: from + name.length + 2 },
    })
  }
}

export function scriptCompletions(getKnownNames: () => Set<string>) {
  const scopeOptions: Completion[] = [
    ...SCRIPT_CONTEXT_PARAMS.slice(1).map((name) => ({
      label: name,
      type: 'variable',
    })),
    ...SCRIPT_HELPER_NAMES.map((name) => ({ label: name, type: 'function' })),
  ]

  return (context: CompletionContext): CompletionResult | null => {
    // Dentro de {{ solo campos; una llave sola es JS y no abre la lista.
    const insideRef = context.matchBefore(/\{\{[ \t]*\w*/)

    if (insideRef) {
      const typed: number = /\w*$/.exec(insideRef.text)?.[0].length ?? 0

      return {
        from: insideRef.to - typed,
        options: [...getKnownNames()].map((name) => ({
          label: name,
          type: 'variable',
          apply: applyFieldRef(name),
        })),
        validFor: /^\w*$/,
      }
    }

    const word = context.matchBefore(/\w+/)

    // Ctrl+Espacio muestra todo; al escribir solo funciones, o un Enter cambiaria una variable por
    // un campo.
    if (context.explicit) {
      return {
        from: word?.from ?? context.pos,
        options: [
          ...scopeOptions,
          ...[...getKnownNames()].map((name) => ({
            label: name,
            type: 'variable',
            detail: 'campo',
            apply: fieldRefText(name),
          })),
        ],
        validFor: /^\w*$/,
      }
    }

    if (!word) return null

    return { from: word.from, options: scopeOptions, validFor: /^\w*$/ }
  }
}

// Una {{x}} desconocida es error. La sintaxis se reporta en el panel: el editor ve la fuente con
// {{}}, no el JS compilado.
export function unknownRefDiagnostics(view: EditorView, knownNames: Set<string>): Diagnostic[] {
  return scriptRefs(view.state.doc.toString(), knownNames)
    .filter((ref) => !ref.known)
    .map((ref) => ({
      from: ref.start,
      to: ref.end,
      severity: 'error' as const,
      message: unknownRefsMessage([ref.name]),
    }))
}
