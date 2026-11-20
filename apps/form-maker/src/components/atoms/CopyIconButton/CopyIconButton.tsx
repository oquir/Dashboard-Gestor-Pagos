import { useEffect, useRef, useState } from 'react'
import { CheckCircle, Copy } from 'reicon-react'
import { Tooltip } from '../Tooltip'
import type { CopyIconButtonProps } from './CopyIconButton.types'
import { ENTER_CHECK_CLASSES } from '../../../constants'

export function CopyIconButton({ value, title = 'Copiar' }: CopyIconButtonProps) {
  const [copied, setCopied] = useState<boolean>(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(value)
    setCopied(true)

    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Tooltip content={copied ? 'Copiado' : title}>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copiado' : title}
        className="flex h-5 w-5 items-center justify-center rounded text-fg-subtle transition-colors hover:cursor-pointer hover:text-fg"
      >
        <span key={copied ? 'copied' : 'copy'} className={`flex ${ENTER_CHECK_CLASSES}`}>
          {copied ? <CheckCircle size={12} weight="Filled" /> : <Copy size={12} />}
        </span>
      </button>
    </Tooltip>
  )
}
