import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

// Toast cuando una hoja deja de caber: solo al pasar de caber a no caber, no en cada px. El id lo
// deduplica y lo cierra al volver a caber. Requiere <Toaster /> arriba.
export function usePdfOverflowToast(
  sheetId: string,
  sheetNumber: number,
  bottom: number,
  right: number,
): void {
  const numberRef = useRef<number>(sheetNumber)
  // Va antes de los efectos que lo leen: en un mismo commit corren en orden de declaracion.
  useEffect(() => {
    numberRef.current = sheetNumber
  }, [sheetNumber])
  const hasBottom: boolean = bottom > 0
  const hasRight: boolean = right > 0
  const bottomId: string = `pdf-overflow-bottom-${sheetId}`
  const rightId: string = `pdf-overflow-right-${sheetId}`

  useEffect(() => {
    if (hasBottom) {
      toast.error(`Hoja ${numberRef.current}: no cabe`, {
        id: bottomId,
        description: 'Pasa algo a otra hoja o achica el margen.',
      })
    } else {
      toast.dismiss(bottomId)
    }
  }, [hasBottom, bottomId])

  useEffect(() => {
    if (hasRight) {
      toast.error(`Hoja ${numberRef.current}: se sale por la derecha`, {
        id: rightId,
        description: 'Se pierde el borde. Achica el ancho de una columna.',
      })
    } else {
      toast.dismiss(rightId)
    }
  }, [hasRight, rightId])

  // Si la hoja se borra con el aviso abierto, que no quede huerfano.
  useEffect(
    () => () => {
      toast.dismiss(bottomId)
      toast.dismiss(rightId)
    },
    [bottomId, rightId],
  )
}
