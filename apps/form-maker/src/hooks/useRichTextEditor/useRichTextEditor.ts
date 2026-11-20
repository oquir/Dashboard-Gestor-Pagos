import { type ClipboardEvent, useEffect, useRef, useState } from 'react'
import { serializeRichText } from '../../lib/richText/richText'
import { safeHref } from '../../lib/richText/richText.utils'
import type { RichTextCommand, RichTextContent } from '../../types/richText'
import { INVALID_URL_MESSAGE, NO_SELECTION_MESSAGE } from './useRichTextEditor.constants'
import type { UseRichTextEditorParams, UseRichTextEditorResult } from './useRichTextEditor.types'
import {
  currentSelectionRange,
  renderRichTextInto,
  restoreSelection,
} from './useRichTextEditor.utils'

// Estado del editor de texto con formato: pinta el modelo creando nodos (nunca innerHTML) y lee con
// serializeRichText, que sanea. La seleccion se guarda antes de abrir el input del enlace.
export function useRichTextEditor({
  value,
  onChange,
}: UseRichTextEditorParams): UseRichTextEditorResult {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const savedRange = useRef<Range | null>(null)
  // Lo que el DOM ya muestra (null antes del primer pintado). Por referencia: el eco de lo escrito
  // vuelve como el mismo objeto.
  const shown = useRef<RichTextContent | undefined | null>(null)
  const [linkOpen, setLinkOpen] = useState<boolean>(false)
  const [linkValue, setLinkValue] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Repinta si value llega distinto de lo mostrado (deshacer). El eco no se repinta: moveria el
  // cursor. Sin repintar, el siguiente blur pisaria lo deshecho.
  useEffect(() => {
    if (!editorRef.current || value === shown.current) return

    shown.current = value
    renderRichTextInto(editorRef.current, value)
  }, [value])

  function emit(): void {
    if (!editorRef.current) return

    const content: RichTextContent = serializeRichText(editorRef.current)
    shown.current = content
    onChange(content)
  }

  // Pegar entra como texto plano: el HTML del portapapeles deja estilos en el DOM que el modelo no
  // tiene. insertText respeta el deshacer nativo.
  function pastePlainText(event: ClipboardEvent<HTMLDivElement>): void {
    event.preventDefault()

    const text: string = event.clipboardData.getData('text/plain').replace(/\r\n?/g, '\n')
    if (text === '') return

    document.execCommand('insertText', false, text)
    emit()
  }

  function runCommand(command: RichTextCommand): void {
    editorRef.current?.focus()
    document.execCommand('styleWithCSS', false, 'false')
    document.execCommand(command)
    emit()
  }

  function openLinkInput(): void {
    const range: Range | null = currentSelectionRange()

    if (!range) {
      setError(NO_SELECTION_MESSAGE)
      return
    }

    savedRange.current = range
    setError('')
    setLinkValue('')
    setLinkOpen(true)
  }

  function applyLink(): void {
    const href: string | undefined = safeHref(linkValue)

    if (!href) {
      setError(INVALID_URL_MESSAGE)
      return
    }

    editorRef.current?.focus()
    restoreSelection(savedRange.current)
    document.execCommand('createLink', false, href)
    savedRange.current = null
    setLinkOpen(false)
    setError('')
    emit()
  }

  function cancelLink(): void {
    setLinkOpen(false)
    setError('')
  }

  function removeLink(): void {
    editorRef.current?.focus()
    document.execCommand('unlink')
    emit()
  }

  return {
    editorRef,
    linkOpen,
    linkValue,
    error,
    setLinkValue,
    emit,
    pastePlainText,
    runCommand,
    openLinkInput,
    applyLink,
    cancelLink,
    removeLink,
  }
}
