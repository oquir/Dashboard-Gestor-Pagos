import { useEffect } from 'react'
import { usePdfDesignStore } from '../../store/pdfDesignStore'
import { PDF_AUTOSAVE_DELAY_MS } from './usePdfDesignAutosave.constants'
import { startPdfAutosave } from './usePdfDesignAutosave.utils'

// Autoguardado del diseño del PDF mientras el diseñador esta montado. No usa el intervalo de 3
// minutos del formulario: el diseño es chico (salvo imagenes en base64) y se guarda poco despues de
// cada cambio, en la llave de su impuesto. Al desmontar guarda lo pendiente, para que "Volver al
// formulario" no pierda el ultimo cambio. La logica vive en startPdfAutosave, que no necesita React.
export function usePdfDesignAutosave(): void {
  useEffect(() => startPdfAutosave(usePdfDesignStore, PDF_AUTOSAVE_DELAY_MS), [])
}
