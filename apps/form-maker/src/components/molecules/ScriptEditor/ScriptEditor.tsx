import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { bracketMatching, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { linter } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { placeholder as cmPlaceholder, drawSelection, EditorView, keymap } from '@codemirror/view'
import { useEffect, useRef } from 'react'
import { SCRIPT_HIGHLIGHT, SCRIPT_THEME } from './ScriptEditor.constants'
import type { ScriptEditorProps } from './ScriptEditor.types'
import { fieldRefHighlighter, scriptCompletions, unknownRefDiagnostics } from './ScriptEditor.utils'

export function ScriptEditor({
  id,
  ariaLabel,
  value,
  knownNames,
  placeholder,
  minHeight = '10rem',
  maxHeight,
  onChange,
}: ScriptEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  // Por ref y no como dependencia: recrear el editor perderia el cursor en cada tecla.
  const onChangeRef = useRef(onChange)
  const knownNamesRef = useRef(knownNames)

  useEffect(() => {
    onChangeRef.current = onChange
    knownNamesRef.current = knownNames
  })

  // Solo al montar: depender de value, id, etiqueta o placeholder rearmaria el editor entero.
  useEffect(() => {
    const host: HTMLDivElement | null = hostRef.current
    if (!host) return

    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          javascript(),
          syntaxHighlighting(SCRIPT_HIGHLIGHT),
          autocompletion({ override: [scriptCompletions(() => knownNamesRef.current)] }),
          linter((target) => unknownRefDiagnostics(target, knownNamesRef.current)),
          fieldRefHighlighter(() => knownNamesRef.current),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ id, 'aria-label': ariaLabel }),
          ...(placeholder ? [cmPlaceholder(placeholder)] : []),
          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
          SCRIPT_THEME,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString())
          }),
        ],
      }),
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rearmar el editor tiraria el cursor
  }, [])

  // Cambios de afuera (deshacer, borrador). Entra al historial de CodeMirror: otro documento tiene
  // que llegar con un editor nuevo (key), nunca por aca.
  useEffect(() => {
    const view: EditorView | null = viewRef.current
    if (!view || view.state.doc.toString() === value) return

    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
  }, [value])

  // Los limites van como estilo del host: CodeMirror no acepta clases para su alto.
  return (
    <div
      ref={hostRef}
      style={{ minHeight, maxHeight }}
      className="[&_.cm-editor]:max-h-[inherit] [&_.cm-editor]:min-h-[inherit]"
    />
  )
}
