import type { FieldProps } from './Field.types'

export default function Field({ label, help, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : (
        help && <span className="mt-1 block text-xs text-slate-500">{help}</span>
      )}
    </label>
  )
}
