export interface DateRangeProps {
  from: string
  to: string
  changeFrom: (date: string) => void
  changeTo: (date: string) => void
}
