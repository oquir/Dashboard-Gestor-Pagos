// Alto fijo de cada linea de la vista JSON. Tiene que coincidir con la clase h-5 de la fila: la
// lista virtual decide que lineas pintar dividiendo la posicion del scroll por este numero.
export const JSON_ROW_HEIGHT_PX: number = 20

// Lineas de mas por arriba y por abajo de lo que se ve, para que un scroll rapido no alcance a
// mostrar el hueco antes de que se pinten las siguientes.
export const JSON_ROW_OVERSCAN: number = 30

// Lo que se pinta antes de la primera medida, que llega antes de que el navegador pinte.
export const JSON_INITIAL_ROW_COUNT: number = 80
