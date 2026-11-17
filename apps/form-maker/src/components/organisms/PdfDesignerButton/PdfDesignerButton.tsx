import { FilePdf } from 'reicon-react'
import { FORM_TYPES } from '../../../constants'
import { useFormStore } from '../../../store'
import { PDF_BUTTON_CLASSES, PDF_CAPTION_CLASSES } from './PdfDesignerButton.constants'

// La puerta al diseñador de PDF. Dice de que impuesto es la plantilla que va a abrir: hay una por
// impuesto, no por formulario, asi que dos formularios del mismo impuesto comparten la misma.
export function PdfDesignerButton() {
  const formType = useFormStore((state) => state.setupConfig.formType)
  const setPdfDesignerOpen = useFormStore((state) => state.setPdfDesignerOpen)

  const taxLabel: string | undefined = FORM_TYPES.find((option) => option.value === formType)?.label

  return (
    <>
      <button type="button" onClick={() => setPdfDesignerOpen(true)} className={PDF_BUTTON_CLASSES}>
        <FilePdf size={14} />
        Diseñar PDF
      </button>
      <p className={PDF_CAPTION_CLASSES}>
        {taxLabel ? `Plantilla de ${taxLabel}` : 'El formulario no tiene impuesto definido'}
      </p>
    </>
  )
}
