export const TIPO_DOCUMENTO_NIT: string = '2'

// Solo digitos, de largo min..max, sin valores de relleno: (?!0) no arranca en cero;
// (?!([0-9])\1+$) no son todos el mismo digito; el largo va en el patron para dar un solo mensaje.
// \\1 y [0-9] a proposito: el patron viaja en un string que el consumidor ejecuta con new Function,
// y cada barra invertida pasa por JSON y por el parser de JS.
function digitosSinRellenos(min: number, max: number): string {
  return `^(?!0)(?!([0-9])\\1+$)[0-9]{${min},${max}}$`
}

export const DOCUMENTO_PATTERN: string = digitosSinRellenos(6, 10)

// Un NIT son 9 digitos: el decimo es el digito de verificacion, y ese va en su propio campo.
export const NIT_PATTERN: string = digitosSinRellenos(6, 9)

export const DOCUMENTO_MESSAGE: string = 'Ingrese un documento válido'

// Un solo regex da un solo mensaje para cualquier fallo: por eso nombra el DV como instruccion y no
// como diagnostico.
export const NIT_MESSAGE: string = 'Ingrese un NIT válido, sin el dígito de verificación'

// Los numericos que NO llevan plata: se nombran las excepciones, asi un renglon nuevo entra
// redondeando por defecto.
export const FIELDS_WITHOUT_ROUNDING: string[] = [
  // Una tarifa del 4 por mil aproximada al millar es 0, y con ella todo impuesto de actividad.
  'tarifa_x_mil',
  // El digito de verificacion va de 0 a 9.
  'dv',
  // Un conteo de establecimientos, no un valor.
  'numero_establecimientos',
  // Renglon 18: kilovatios, no pesos.
  'generacion_energia_kw',
]

// Los unicos calculados que pueden dar negativo y se recortan a 0 (los number ya declaran min: 0).
// Los demas son sumas de no negativos o ya vienen con max(..., 0). El recorte avisa en pantalla: en
// el 38 saltaria con cada saldo a favor, que es normal.
export const CALCULATED_WITHOUT_NEGATIVE: string[] = [
  // r10 = ingresos nacionales - ingresos fuera del municipio.
  'total_ingresos_ordinarios',
  // r16 = el 10 menos las cinco deducciones. Es el caso tipico: deducciones mayores al ingreso.
  'total_ingresos_gravables',
]

// La declaracion no lleva decimales en ningun renglon.
export const TEMPLATE_DECIMALS: number = 0

// La excepcion: con un decimal la columna se lee pareja (4,0 / 7,5 / 6,0).
export const DECIMALS_BY_FIELD: Record<string, number> = {
  tarifa_x_mil: 1,
}

// El prefijo de todo renglon de plata, que son los numericos fuera de FIELDS_WITHOUT_ROUNDING.
export const MONEY_PREFIX: string = '$'

// La unidad de los que no llevan plata. X1000 y no ‰: el por mil se confunde con el por ciento.
export const SUFFIX_BY_FIELD: Record<string, string> = {
  tarifa_x_mil: 'X1000',
  generacion_energia_kw: 'kW',
}

// Ids a mano de EXTEMPORANEIDAD y OTRA en tipos_sancion (el editor de condiciones aun no ofrece
// opciones de catalogo). Si el catalogo se reordena, se rompe en silencio.
export const TIPO_SANCION_EXTEMPORANEIDAD: string = '1'

export const TIPO_SANCION_OTRA: string = '4'

// Renglon 31 entero dentro del script del campo (parametros del municipio, base y articulo 641):
// quien atiende un pedido abre el renglon y ve la regla completa, sin buscar la mitad en el
// prelude. La plantilla lo siembra; despues es del autor.
// Lleva tildes a proposito: es contenido que se lee dentro del editor.
export const SANCION_EXTEMPORANEIDAD_SCRIPT: string = `// --- Parámetros del municipio ---
// La ley fija estos valores como techo: un municipio solo puede bajarlos.

// UVT del año en que se liquida la sanción, no la del año gravable declarado.
// uvt() la busca en la pestaña Catálogos; si ese año no está cargado devuelve
// null y entra el respaldo escrito acá, que hay que actualizar una vez por año.
const UVT = uvt() ?? 52374;

// Sanción mínima, en UVT. El Estatuto Tributario pide 10; hay municipios
// que la dejan en 2, 3 o 5.
const MINIMA_UVT = 10;

// Cuánto crece por cada mes o fracción de mes de atraso. El ET pide 5%;
// hay municipios que aplican 10%, 1% u otro valor.
const POR_MES = 0.05;

// Tope de la sanción, como proporción de la base. El ET pide 100%.
const TOPE = 1;

// Sobre qué se liquida. El renglón 25 es el impuesto a cargo, que NO es el
// saldo a cargo del 33: ese ya restó retenciones y anticipos. Hay municipios
// que piden liquidarla sobre otro renglón; se cambia esta línea.
//
// Ojo con poner acá el 33, el 34, el 35 o el 38: todos incluyen a este mismo
// renglón en su cuenta, así que se armaría un cálculo circular.
const base = {{total_impuesto_a_cargo}};

// El período dentro del año. La declaración de ICA es anual, así que es 1.
const periodo = 1;

// --- Regla del artículo 641 ---

// Solo la extemporaneidad se autoliquida. Para los otros tipos devolvemos
// undefined, que significa "dejá lo que escriba el usuario": el campo no se
// marca como calculado y se sigue pudiendo teclear.
if ({{tipo_sancion}} !== "${TIPO_SANCION_EXTEMPORANEIDAD}") return undefined;

// Meses o fracción de atraso contra la tabla de la pestaña Fechas.
// Sin tabla cargada devuelve 0, y entonces no hay sanción.
const meses = mesesDeMora({{periodo_anio}}, periodo, {{numero_documento}});

// Sin atraso no hay sanción, y esta salida va antes que el mínimo: el mínimo
// es el piso de una sanción que existe, no crea una donde no la había.
if (meses <= 0) return 0;

return max(min(base * POR_MES * meses, base * TOPE), UVT * MINIMA_UVT);`

// Renglon 37, con el mismo criterio que la sancion. La base va suelta porque es lo que mas cambia;
// no puede ser el 38, que consume estos intereses (ciclo). Sin fecha limite devuelve undefined
// (tecleable): un 0 bloqueado pareceria un calculo hecho.
export const INTERES_MORA_SCRIPT: string = `// --- Parámetros del municipio ---

// Tasa de interés moratorio, efectiva anual. Es la de usura para consumo y
// ordinario que certifica la Superfinanciera, menos 2 puntos (art. 635 ET).
// CAMBIA TODOS LOS MESES y se aplica la vigente al momento del pago, no la
// del vencimiento. Esta es la de agosto de 2026 (usura 29,66% − 2).
const TASA_ANUAL = 0.2766;

// Los días del año con los que se saca la tasa diaria. 366 en año bisiesto,
// si el municipio los cuenta así.
const DIAS_ANIO = 365;

// Sobre qué se liquidan. El renglón 35 es lo que de verdad se debe: ya viene
// recortado, así que con saldo a favor vale 0 y no se cobran intereses sobre
// una deuda que no existe.
//
// Cambiar esta línea por otro renglón es todo lo que hace falta. El único que
// NO puede ir acá es el 38 ({{total_a_pagar}}), que es el que consume estos
// intereses y cerraría un cálculo circular.
const base = {{valor_a_pagar}};

// El período dentro del año. La declaración de ICA es anual, así que es 1.
const periodo = 1;

// --- Cálculo ---

// Sin fecha límite no hay con qué comparar, y entonces no se sabe si hay mora
// ni de cuánto. Se devuelve undefined para dejar el campo escribible a mano en
// vez de mostrar un 0 bloqueado que parece un cálculo ya hecho.
const limite = fechaLimite({{periodo_anio}}, periodo, {{numero_documento}});
if (limite === null) return undefined;

const dias = diasDeMora({{periodo_anio}}, periodo, {{numero_documento}});
if (dias <= 0) return 0;

// Hacia arriba al millar, que es el ROUNDUP(...;-3) con el que se liquida.
// No es el redondeo al más cercano del resto de los renglones.
return ceil((base * (TASA_ANUAL / DIAS_ANIO) * dias) / 1000) * 1000;`

// Lo declarado por actividad tiene que sumar el renglon 16 (si no, es evasion). Tolerancia de un
// peso por la coma flotante.
export const INGRESOS_ACTIVIDADES_SCRIPT: string =
  'return abs(sum({{ingresos_gravados}}) - {{total_ingresos_gravables}}) < 1;'

export const INGRESOS_ACTIVIDADES_MESSAGE: string =
  'La suma de los ingresos gravados de las actividades debe ser igual al renglón 16 (Total ingresos gravables).'

// El neto sin recortar que comparten el 33 y el 34; sin return porque se interpola dentro de
// max(...).
export const SALDO_NETO: string =
  '{{total_impuesto_a_cargo}} - {{valor_exencion_exoneracion_impuesto}} - {{retenciones_a_favor}} - {{autorretenciones_a_favor}} - {{anticipo_liquidado_anio_anterior}} + {{anticipo_anio_siguiente}} + {{valor_sancion}} - {{saldo_favor_periodo_anterior}}'
