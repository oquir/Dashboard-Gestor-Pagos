import type { CSSProperties } from 'react'
import type { SheetOverflow } from './PdfSheetView.types'
import {
  PDF_BACK_MARGIN_MM,
  PDF_PAPER_HEIGHT_MM,
  PDF_PAPER_WIDTH_MM,
  PDF_PX_PER_MM,
} from '../../../../constants'

export const BACK_MARGIN_PX: number = PDF_BACK_MARGIN_MM * PDF_PX_PER_MM

export const PAPER_WIDTH_PX: number = PDF_PAPER_WIDTH_MM * PDF_PX_PER_MM

export const PAPER_HEIGHT_PX: number = PDF_PAPER_HEIGHT_MM * PDF_PX_PER_MM

export const NO_OVERFLOW: SheetOverflow = { bottom: 0, right: 0 }

export const PAPER_SIZE: CSSProperties = {
  width: PAPER_WIDTH_PX,
  height: PAPER_HEIGHT_PX,
}
