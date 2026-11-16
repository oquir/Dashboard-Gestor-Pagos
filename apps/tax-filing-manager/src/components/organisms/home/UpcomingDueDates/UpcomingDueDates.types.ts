export interface UpcomingDueDate {
  id: string
  tax: string
  periodText: string
  /** Primera fecha límite del periodo. */
  date: string
  /** Última fecha, si cambia según el último dígito del NIT o la cédula. */
  to?: string
  decree?: string
  /** Días hasta la primera fecha. */
  daysLeft: number
  /** Días hasta la última fecha (la misma que la primera si no cambia por dígito). */
  daysUntil: number
}

export interface UpcomingDueDatesProps {
  className?: string
  municipalityId: string | null
}
