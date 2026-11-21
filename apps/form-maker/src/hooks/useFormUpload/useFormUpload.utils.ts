import { describeApiResponse } from '../../lib/fakeApi/fakeApi'
import type { FormUploadResult } from '../../types/upload'

export function describeUpload(result: FormUploadResult): string {
  return `${result.formId} · ${describeApiResponse(result)}`
}
