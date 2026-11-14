import type { ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'reicon-react'
import { JSON_ROW_HEIGHT_PX } from '../../../constants'
import { useJsonCode, useJsonViewport } from '../../../hooks'
import type { JsonCodeProps } from '../../../types'
import { JsonSearchBar } from '../JsonSearchBar'
import {
  JSON_CODE_BASE_CLASSES,
  JSON_CODE_SCROLLER_CLASSES,
  JSON_MUTED_CLASS,
  JSON_ROW_CLASSES,
} from './JsonCode.constants'
import { renderTokens } from './JsonCode.utils'

// Solo se pintan las filas que se ven (useJsonViewport). La lista mide lo que medirian todas, asi el
// scroll es el de siempre, y su ancho minimo sale de la linea mas larga para que el scroll
// horizontal no cambie de largo mientras se baja. Ctrl+F abre el buscador propio (useJsonCode).
export function JsonCode({ json, valueClassName, className, captureFind = false }: JsonCodeProps) {
  const {
    rootRef,
    rows,
    toggle,
    longestLine,
    search,
    searchInputRef,
    highlights,
    reveal,
    revealIndex,
  } = useJsonCode(json, captureFind)
  const { listRef, range } = useJsonViewport(rows.length, reveal, revealIndex)

  return (
    <div ref={rootRef} className={`${JSON_CODE_BASE_CLASSES} ${className ?? ''}`.trim()}>
      {search.isOpen && <JsonSearchBar search={search} inputRef={searchInputRef} />}

      <div className={JSON_CODE_SCROLLER_CLASSES}>
        <div
          ref={listRef}
          style={{
            height: rows.length * JSON_ROW_HEIGHT_PX,
            minWidth: `calc(${longestLine}ch + 1rem)`,
          }}
        >
          <div style={{ paddingTop: range.start * JSON_ROW_HEIGHT_PX }}>
            {rows.slice(range.start, range.end).map((row) => {
              const content: ReactNode[] = renderTokens(
                row.tokens,
                valueClassName,
                highlights.get(row.lineIndex),
              )

              if (row.isCollapsed) {
                content.push(
                  <span key="fold" className={JSON_MUTED_CLASS}>
                    {` … ${row.closeChar}${row.trailingComma ? ',' : ''}`}
                  </span>,
                )
              }

              return (
                <div key={row.key} className={JSON_ROW_CLASSES}>
                  <span className="shrink-0 whitespace-pre">{row.indent}</span>
                  {row.opensContainer ? (
                    <button
                      type="button"
                      onClick={() => toggle(row.lineIndex)}
                      className="flex w-4 shrink-0 cursor-pointer items-center justify-center text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200"
                    >
                      {row.isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                    </button>
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                  <span className="shrink-0 whitespace-pre">{content}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
