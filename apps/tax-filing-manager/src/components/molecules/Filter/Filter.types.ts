export interface FilterProps<T extends string> {
  label: string
  options: Record<T, string>
  value: T
  change: (value: T) => void
}
