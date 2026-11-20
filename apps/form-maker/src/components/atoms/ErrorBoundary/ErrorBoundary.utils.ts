// Un throw puede lanzar cualquier valor, no solo un Error.
export function describeError(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') return error.message
  const text: string = String(error)
  return text.trim() === '' ? 'Error sin descripción.' : text
}
