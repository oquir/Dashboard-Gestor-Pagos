import type { ConceptValueKey, ConceptValueKind } from '../types/fieldConcept'

// Fuera de PAYLOAD_SCHEMA a proposito: la arma el consumidor, y ahi se ofreceria como arrayPath de
// un grupo.
export const CONCEPTS_PAYLOAD_KEY = 'conceptos'

// IdConcepto es int en el backend: uno mayor haria rechazar la declaracion entera.
export const CONCEPT_ID_MAX: number = 2_147_483_647

// Tipo de dato de cada campo. Los de opciones mandan texto (regla en runtimePayload); los
// presentacionales no estan.
export const CONCEPT_KIND_BY_FIELD_TYPE: Record<string, ConceptValueKind> = {
  text: 'texto',
  textarea: 'texto',
  number: 'numero',
  calculated: 'numero',
  checkbox: 'booleano',
  select: 'texto',
  search_select: 'texto',
  toggle_group: 'texto',
  radio_group: 'texto',
  checkbox_group: 'lista',
  file: 'archivo',
}

// El archivo viaja por su nombre: el binario no cabe en el JSON y va aparte.
export const CONCEPT_VALUE_KEY: Record<ConceptValueKind, ConceptValueKey> = {
  texto: 'valorTexto',
  numero: 'valorNumero',
  booleano: 'valorBooleano',
  lista: 'valorLista',
  archivo: 'valorTexto',
}
