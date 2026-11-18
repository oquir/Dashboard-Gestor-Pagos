import { FilePdf } from 'reicon-react'
import { FORM_TYPES } from '../../../constants'
import { useFormStore } from '../../../store'
import { Tooltip } from '../../atoms'
import { PDF_BUTTON_CLASSES } from './PdfDesignerButton.constants'
import type { PdfDesignerButtonProps } from './PdfDesignerButton.types'

// La puerta al diseñador de PDF. Hay una plantilla por impuesto, no por formulario, asi que dos
// formularios del mismo impuesto comparten la misma. Esa leyenda viaja en el tooltip: en la fila de
// acciones el boton va sin etiqueta y no hay lugar para un renglon debajo.
export function PdfDesignerButton({ iconOnly = false }: PdfDesignerButtonProps) {
  const formType = useFormStore((state) => state.setupConfig.formType)
  const setPdfDesignerOpen = useFormStore((state) => state.setPdfDesignerOpen)

  const taxLabel: string | undefined = FORM_TYPES.find((option) => option.value === formType)?.label
  const label: string = `Diseñar el PDF de la declaración · ${
    taxLabel ? `Plantilla de ${taxLabel}` : 'el formulario no tiene impuesto definido'
  }`

  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={() => setPdfDesignerOpen(true)}
        aria-label={iconOnly ? label : undefined}
        className={PDF_BUTTON_CLASSES}
      >
        <FilePdf size={13} />
        {!iconOnly && 'Diseñar PDF'}
      </button>
    </Tooltip>
  )
}
