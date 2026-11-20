import type { RepeatableGroup } from '../../../types'

export function buildGroupSummary(group: RepeatableGroup): string {
  const activeChecks: number = (group.checks ?? []).filter((check) => check.enabled).length

  const parts: (string | null)[] = [
    `${group.min}–${group.max} repeticiones`,
    group.arrayPath ? `${group.arrayPath}[]` : 'sin mapear',
    activeChecks > 0 ? `${activeChecks} comprobación${activeChecks === 1 ? '' : 'es'}` : null,
  ]

  return parts.filter((part): part is string => part !== null).join(' · ')
}
