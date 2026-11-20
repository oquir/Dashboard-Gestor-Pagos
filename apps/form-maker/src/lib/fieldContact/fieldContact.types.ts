import type { PhoneKind } from '../../types/fieldContact'

// Estructural, para que entren CanvasField y ExportedField.
export interface ContactField {
  type: string
  phoneKind?: PhoneKind
}
