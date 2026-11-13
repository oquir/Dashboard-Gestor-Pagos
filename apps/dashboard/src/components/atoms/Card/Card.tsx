import type { CardProps } from './Card.types'

export default function Card({ children, className = '', id }: CardProps) {
  return (
    <section
      id={id}
      className={`rounded-xl border border-border bg-surface shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}
