import { PDF_BACK_MARGIN_MM, PDF_PX_PER_MM } from '../../../../constants'

export const BACK_MARGIN_PX: number = PDF_BACK_MARGIN_MM * PDF_PX_PER_MM

// Sin dark: a proposito, es papel. shrink-0 para que una ventana angosta no la aplaste: se desplaza.
export const PAPER_CLASSES: string =
  'relative shrink-0 bg-white text-black shadow-md ring-1 ring-black/10'

export const EXTRA_MARGIN_GUIDE_CLASSES: string = 'outline-1 outline-dashed outline-brand/60'

export const CELL_BORDER: string = '1px solid #000'
