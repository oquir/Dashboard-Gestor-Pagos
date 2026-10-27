import type { CardProps } from './types'

export default function Card({ children, className = '', id }: CardProps) {
  return (
    <section id={id} className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  )
}
