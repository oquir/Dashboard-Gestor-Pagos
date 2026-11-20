import { useEffect, useState } from 'react'
import { isSafePdfImageSrc } from '../../lib/pdfHtml'
import type { PdfImageCheck } from '../../types'
import { NO_IMAGE_CHECK, VARIABLE_SOURCE } from './usePdfImageCheck.constants'

// Carga la imagen de un componente para saber su tamano real y avisar si pesa mucho mas de lo que
// se muestra. Lo que no se puede cargar queda en 'none'. Chunk del PDF: fuera de hooks/index.ts.
export function usePdfImageCheck(src: string): PdfImageCheck {
  const value: string = src.trim()
  const loadable: boolean = value !== '' && !VARIABLE_SOURCE.test(value) && isSafePdfImageSrc(value)
  const [check, setCheck] = useState<{ src: string; result: PdfImageCheck }>({
    src: '',
    result: NO_IMAGE_CHECK,
  })

  useEffect(() => {
    if (!loadable) return
    let alive: boolean = true
    const image: HTMLImageElement = new Image()
    image.onload = () => {
      if (!alive) return
      setCheck({
        src: value,
        result: {
          status: 'ok',
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
        },
      })
    }
    image.onerror = () => {
      if (alive) setCheck({ src: value, result: { status: 'error' } })
    }
    image.src = value
    return () => {
      alive = false
    }
  }, [loadable, value])

  if (!loadable) return NO_IMAGE_CHECK
  // Mientras carga una imagen nueva no vale lo que se supo de la anterior.
  return check.src === value ? check.result : { status: 'loading' }
}
