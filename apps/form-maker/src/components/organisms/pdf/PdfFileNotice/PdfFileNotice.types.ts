import type { PdfFileNotice } from '../../../../types'

export interface PdfFileNoticeProps {
  notice: PdfFileNotice
  onDismiss: () => void
}
