import type { PdfDesign, PdfSheet } from '../../../../types'

export interface PdfSheetViewProps {
  sheet: PdfSheet
  design: PdfDesign
  index: number
  total: number
}
