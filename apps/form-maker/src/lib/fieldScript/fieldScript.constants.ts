// {{ identificador }} en una linea, con espacios o tabs. Las llaves dobles no son JS valido: no se
// confunden con una desestructuracion. Sticky: se prueba en una posicion, no se busca.
export const REF_PATTERN: RegExp = /\{\{[ \t]*([A-Za-z_][A-Za-z0-9_]*)[ \t]*\}\}/y
