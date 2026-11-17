/** El texto de lo que se lanzó, que no siempre es un `Error`: un `throw` de cualquier valor también llega aquí. */
export function describeError(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') return error.message
  const text = String(error)
  return text.trim() === '' ? 'Error sin descripción.' : text
}
