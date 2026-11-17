// Lo que se lanza no siempre es un Error: un throw de cualquier valor tambien llega aca.
export function describeError(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') return error.message
  const text: string = String(error)
  return text.trim() === '' ? 'Error sin descripción.' : text
}
