import { useEffect } from 'react'
import { usePdfDesignStore } from '../../store/pdfDesignStore'
import { PDF_AUTOSAVE_DELAY_MS } from './usePdfDesignAutosave.constants'
import { startPdfAutosave } from './usePdfDesignAutosave.utils'

// Autoguardado del diseno del PDF mientras el disenador esta montado, poco despues de cada cambio,
// en la llave de su impuesto. Al desmontar guarda lo pendiente. La logica vive en startPdfAutosave.
export function usePdfDesignAutosave(): void {
  useEffect(() => startPdfAutosave(usePdfDesignStore, PDF_AUTOSAVE_DELAY_MS), [])
}
