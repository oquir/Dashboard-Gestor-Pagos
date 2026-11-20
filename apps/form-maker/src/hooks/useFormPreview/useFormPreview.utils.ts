import type { PreviewState, RuntimeModel, RuntimeValues } from '../../types'

export function emptyGroupItem(model: RuntimeModel, groupId: string): RuntimeValues {
  const item: RuntimeValues = {}

  for (const field of model.groupFields.get(groupId) ?? []) item[field.name] = undefined

  return item
}

// El modelo se rehace en cada edicion: acomoda grupos nuevos o borrados sin perder lo escrito.
export function reconcileState(model: RuntimeModel, state: PreviewState): PreviewState {
  const groups: Record<string, RuntimeValues[]> = {}
  let changed = false

  for (const [groupId] of model.groupFields) {
    const min: number = Math.max(1, model.groupsById.get(groupId)?.min ?? 1)
    const current: RuntimeValues[] = state.groups[groupId] ?? []
    const filled: RuntimeValues[] = [...current]

    while (filled.length < min) filled.push(emptyGroupItem(model, groupId))

    if (filled.length !== current.length) changed = true
    groups[groupId] = filled
  }

  if (Object.keys(groups).length !== Object.keys(state.groups).length) changed = true

  // El mismo objeto si nada cambio: si no, el efecto entraria en bucle.
  return changed ? { ...state, groups } : state
}
