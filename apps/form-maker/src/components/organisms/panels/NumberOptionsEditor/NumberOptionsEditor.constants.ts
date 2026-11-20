// Lista y no input libre: un 17 de mas no falla, solo da un campo raro. El tope es
// MAX_DISPLAY_DECIMALS.
export const DECIMAL_CHOICES: number[] = [0, 1, 2, 3, 4]

export const NUMBER_DESCRIPTION: string =
  'Cómo se escribe, se muestra y se guarda el número. Redondear, fijar decimales y prohibir negativos cambian el valor que viaja en el payload; separar miles, el prefijo y el sufijo solo cambian cómo se ve.'

export const ROUNDING_DESCRIPTION: string =
  'Aproxima al múltiplo de mil más cercano: 499 baja a 0 y 500 sube a 1.000. Cambia el valor, no solo cómo se ve, así que es el número redondeado el que se guarda y el que viaja en el payload. Si lo escribe el usuario se aplica al salir del campo; si lo produce un script o una regla, apenas se calcula.'

export const FORMATTED_DESCRIPTION: string =
  'Muestra 1.000 en vez de 1000 y 1,5 en vez de 1.5, al salir del campo. Esto sí es solo presentación: el valor guardado y el que viaja en el payload siguen siendo el número. Al volver a entrar al campo se ve sin puntos, para poder editarlo.'

export const DECIMALS_DESCRIPTION: string =
  'Con 0 la coma no se puede escribir y el valor se redondea a entero. Con 1 una tarifa de 6 se muestra 6,0, para que la columna quede pareja. Rellenar con ceros es solo presentación, pero recortar decimales sí cambia el valor guardado.'

export const NEGATIVE_DESCRIPTION: string =
  'Apagado, no deja escribir el signo menos y recorta a 0 cualquier resultado negativo de un script o una regla. Recorta el valor, no solo lo que se ve: un total a pagar de −1.000.000 se guarda como 0 y así lo lee el campo de abajo.'

export const OPTION_ROW_CLASSES: string = 'flex items-center justify-between gap-2'

export const OPTION_CONTROL_CLASSES: string = 'flex items-center gap-2'
