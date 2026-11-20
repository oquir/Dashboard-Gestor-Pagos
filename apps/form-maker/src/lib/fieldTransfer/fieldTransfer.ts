import type { CanvasField } from '../../types/field'
import type { CanvasRow } from '../../types/formStructure'
import type { TransferCheck, TransferPayload } from '../../types/transfer'
import { findLabelFor } from '../fieldKind/fieldKind'
import { findNearestFit, getFreeRuns, sortByColumn } from '../rowLayout/rowLayout'

// Mudanzas entre pasos, puras: nucleo comun de mudar un campo o una fila. El campo conserva nombre
// e id (allFieldNames es global), asi que ninguna referencia se rompe.

const ALLOWED: TransferCheck = { allowed: true }

export function canTransfer(rows: CanvasRow[], payload: TransferPayload): TransferCheck {
  if (payload.kind === 'field') {
    const exists: boolean = rows.some((row) =>
      row.fields.some((field) => field.id === payload.fieldId),
    )

    return exists ? ALLOWED : { allowed: false, reason: 'El campo ya no existe.' }
  }

  const row: CanvasRow | undefined = rows.find((candidate) => candidate.id === payload.rowId)
  if (!row) return { allowed: false, reason: 'La fila ya no existe.' }

  // Una fila de un grupo no cambia de paso: el grupo vive en el paso de origen.
  if (row.groupId !== undefined) {
    return { allowed: false, reason: 'Una fila de un grupo repetible no se puede mover de paso.' }
  }

  return ALLOWED
}

// labelFor en los dos sentidos: la pareja se muda entera. La etiqueta primero, para que quede a la
// izquierda.
export function transferGroup(rows: CanvasRow[], fieldId: string): CanvasField[] {
  const fields: CanvasField[] = rows.flatMap((row) => row.fields)
  const field: CanvasField | undefined = fields.find((candidate) => candidate.id === fieldId)
  if (!field) return []

  const partner: CanvasField | null = field.labelFor
    ? (fields.find((candidate) => candidate.id === field.labelFor) ?? null)
    : findLabelFor(fields, fieldId)

  if (!partner) return [field]

  return field.labelFor ? [field, partner] : [partner, field]
}

// Fila por fila y, si ninguna tiene hueco, una nueva: no se rechaza la mudanza.
export function planLanding(
  rows: CanvasRow[],
  moving: CanvasField[],
  createRow: () => CanvasRow,
): CanvasRow[] {
  const result: CanvasRow[] = rows.map((row) => ({ ...row, fields: [...row.fields] }))

  for (const field of moving) {
    let landed = false

    for (const row of result) {
      // Un grupo repetible no recibe mudanzas: con su apiBinding seria un mapeo silencioso.
      if (row.groupId !== undefined) continue

      // Sin resolvePlacement a proposito: su ultimo recurso recorta el campo, y en un paso que no
      // se ve seria estrecharlo sin avisar. Entra entero o va a otra fila.
      const colStart: number | null =
        field.colSpan <= row.columns
          ? findNearestFit(getFreeRuns(row.fields, row.columns), 1, field.colSpan)
          : null

      if (colStart === null) continue

      row.fields = sortByColumn([...row.fields, { ...field, colStart }])
      landed = true
      break
    }

    if (landed) continue

    // La pareja se separa antes que rechazar la mudanza (un campo de 16 columnas y su etiqueta no
    // entran juntos).
    const fresh: CanvasRow = createRow()

    fresh.fields = [{ ...field, colStart: 1, colSpan: Math.min(field.colSpan, fresh.columns) }]
    result.push(fresh)
  }

  return result
}

// Lo que queda a contramano: un campo del modal que depende de uno del formulario (siempre lo veria
// vacio). Se avisa en vez de borrar: el autor decide.
export function collectCrossingRefs(
  otherSideRows: CanvasRow[],
  moving: CanvasField[],
  landsInIntro: boolean,
): string[] {
  const otherFields: CanvasField[] = otherSideRows.flatMap((row) => row.fields)
  // Se mira siempre desde el modal, que es el unico lado que no puede depender del otro.
  const introFields: CanvasField[] = landsInIntro ? moving : otherFields
  const formIds = new Set<string>((landsInIntro ? otherFields : moving).map((field) => field.id))
  const labels = new Set<string>()

  for (const field of introFields) {
    if (referencedIds(field).some((id) => formIds.has(id))) labels.add(field.label)
  }

  return [...labels]
}

// Las mismas fuentes por id que limpia removeFieldsEverywhere; las del script van por nombre y
// viajan con el campo.
function referencedIds(field: CanvasField): string[] {
  const ids: string[] = []

  if (field.enableWhen) ids.push(field.enableWhen.fieldId)
  if (field.visibleWhen) ids.push(field.visibleWhen.fieldId)
  if (field.labelFor) ids.push(field.labelFor)
  if (field.dataSource?.dependsOn) ids.push(field.dataSource.dependsOn)

  for (const rule of field.logic.rules ?? []) {
    for (const condition of rule.when) ids.push(condition.fieldId)
  }

  for (const override of field.validations.overrides ?? []) {
    ids.push(override.when.fieldId)
  }

  return ids
}
