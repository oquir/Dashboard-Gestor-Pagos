// Ya resuelto entre el del autor y el de fabrica del tipo.
export interface PatternRule {
  pattern: string
  message?: string
}

// Cada uno con su patron de fabrica. fax acepta celular o fijo, con extension opcional.
export type PhoneKind = 'celular' | 'fijo' | 'fax'
