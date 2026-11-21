// Conceptos tributarios: lo que el contrato fijo (DeclaracionIcaE) no contempla viaja en una lista
// aparte del payload. Nombres en espanol: es el contrato con el backend. Ver lib/fieldConcept.

// Tipo de dato, no de control: la columna TipoDato del backend, decide que valor* viene lleno.
export type ConceptValueKind = 'texto' | 'numero' | 'booleano' | 'lista' | 'archivo'

export type ConceptValueKey = 'valorTexto' | 'valorNumero' | 'valorBooleano' | 'valorLista'

// Una propiedad por tipo y no un `valor` polimorfico: del otro lado es una clase plana de C#. Solo
// viaja la de `tipo`.
export interface ConceptoPayload {
  idConcepto: number
  tipo: ConceptValueKind
  valorTexto?: string
  valorNumero?: number
  valorBooleano?: boolean
  valorLista?: string[]
}
