import type { PatternRule, PhoneKind } from '../../types/fieldContact'

// Desde 2021 todo numero colombiano tiene 10 digitos. \\1 y [0-9] por lo mismo que en la plantilla:
// viaja en un string que el consumidor ejecuta. Celular: empieza por 3 y no son diez digitos
// iguales.
const CELULAR_PATTERN: string = '^(?!([0-9])\\1+$)3[0-9]{9}$'

// Fijo: 60, indicativo y 7 digitos. No hace de guia de indicativos: rechazar uno valido seria peor.
const FIJO_PATTERN: string = '^60[1-8][0-9]{7}$'

// Fax: celular o fijo con extension opcional de hasta 6 digitos. Un municipio puede reemplazarlo
// con su propia expresion.
export const MAX_EXTENSION_DIGITS: number = 6

// ext, ext. o x, en cualquier caja: las mayusculas van como clases porque el consumidor arma el
// RegExp sin banderas.
const EXTENSION_PATTERN: string = `(?:\\s*(?:[eE][xX][tT]\\.?|[xX])\\s*[0-9]{1,${MAX_EXTENSION_DIGITS}})?`

const FAX_PATTERN: string = `^(?:(?!([0-9])\\1{9})3[0-9]{9}|60[1-8][0-9]{7})${EXTENSION_PATTERN}$`

// El mensaje dice la regla: los fijos de 7 digitos se siguen escribiendo sin el 60X.
export const PHONE_FORMATS: Record<PhoneKind, PatternRule> = {
  celular: {
    pattern: CELULAR_PATTERN,
    message: 'Ingrese un celular válido: 10 dígitos que empiezan por 3',
  },
  fijo: {
    pattern: FIJO_PATTERN,
    message: 'Ingrese un fijo válido: 10 dígitos que empiezan por 60, como 6011234567',
  },
  fax: {
    pattern: FAX_PATTERN,
    message: `Ingrese un celular o fijo de 10 dígitos y, si tiene extensión, agréguela al final con "ext" (hasta ${MAX_EXTENSION_DIGITS} dígitos), como 6011234567 ext 123`,
  },
}

// El patron de correo de HTML5 con dos cambios: anclado (Zod usa .test(), que busca en cualquier
// parte) y con A-Z (no hay bandera i). Sin /g: guardaria lastIndex y alternaria el resultado.
const CORREO_LOCAL: string = "[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]"

const CORREO_ETIQUETA: string = '[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?'

const CORREO_PATTERN: string = `^${CORREO_LOCAL}+(?:\\.${CORREO_LOCAL}+)*@(?:${CORREO_ETIQUETA}\\.)+${CORREO_ETIQUETA}$`

export const EMAIL_FORMAT: PatternRule = {
  pattern: CORREO_PATTERN,
  message: 'Ingrese un correo válido',
}
