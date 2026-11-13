import type { FieldProps } from './Field.types'

export default function Field({ label, help, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-fg">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : (
        help && <span className="mt-1 block text-xs text-fg-muted">{help}</span>
      )}
    </label>
  )
}
