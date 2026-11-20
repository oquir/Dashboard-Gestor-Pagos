import { HighlightStyle } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'

// Colores de los tokens de index.css: el tema oscuro cambia solo, sin recrear extensiones.
export const SCRIPT_THEME = EditorView.theme({
  '&': {
    fontSize: '12px',
    color: 'var(--ui-fg)',
    backgroundColor: 'var(--ui-field)',
    border: '1px solid var(--ui-border)',
    borderRadius: '0.375rem',
  },
  '&.cm-focused': { outline: 'none', borderColor: 'var(--ui-brand-border)' },
  '.cm-scroller': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    lineHeight: '1.6',
    // Explicito: convierte el max-height en scroll propio; sin el las ultimas lineas quedan
    // inalcanzables.
    overflow: 'auto',
  },
  '.cm-content': { padding: '6px 0' },
  '.cm-line': { padding: '0 8px' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--ui-fg-subtle)',
  },
  '.cm-activeLine': { backgroundColor: 'transparent' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--ui-fg)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--ui-surface-inset)',
  },
  '.cm-placeholder': { color: 'var(--ui-fg-subtle)' },
  '.cm-tooltip': {
    backgroundColor: 'var(--ui-surface-raised)',
    border: '1px solid var(--ui-border)',
    borderRadius: '0.375rem',
    color: 'var(--ui-fg)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--ui-brand-surface)',
    color: 'var(--ui-fg-strong)',
  },

  '.cm-field-ref': {
    backgroundColor: 'var(--ui-brand-surface)',
    color: 'var(--ui-brand-fg)',
    borderRadius: '3px',
    padding: '1px 0',
  },
  '.cm-field-ref-unknown': {
    color: 'var(--ui-danger)',
    textDecoration: 'underline dotted var(--ui-danger)',
  },
})

export const SCRIPT_HIGHLIGHT = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--ui-code-keyword)' },
  { tag: tags.controlKeyword, color: 'var(--ui-code-keyword)' },
  { tag: [tags.string, tags.special(tags.string)], color: 'var(--ui-code-string)' },
  { tag: [tags.number, tags.bool, tags.null], color: 'var(--ui-code-number)' },
  {
    tag: [tags.lineComment, tags.blockComment],
    color: 'var(--ui-code-comment)',
    fontStyle: 'italic',
  },
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
    color: 'var(--ui-code-fn)',
  },
  { tag: tags.operator, color: 'var(--ui-fg-muted)' },
  { tag: tags.propertyName, color: 'var(--ui-fg)' },
])
