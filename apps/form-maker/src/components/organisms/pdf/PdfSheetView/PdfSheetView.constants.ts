import type { CSSProperties } from 'react'
import {
  PDF_BACK_MARGIN_MM,
  PDF_PAPER_HEIGHT_MM,
  PDF_PAPER_WIDTH_MM,
  PDF_PX_PER_MM,
} from '../../../../constants'

export const BACK_MARGIN_PX: number = PDF_BACK_MARGIN_MM * PDF_PX_PER_MM

export const PAPER_SIZE: CSSProperties = {
  width: PDF_PAPER_WIDTH_MM * PDF_PX_PER_MM,
  height: PDF_PAPER_HEIGHT_MM * PDF_PX_PER_MM,
}
