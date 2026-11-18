// A cuantos puntos por px CSS se dibuja el PNG. 1 px CSS sale a 0,75 pt; a 300 ppp son unos 3,1
// puntos, asi que con 4 el texto sale nitido aun impreso, y el PNG de un rotulo sigue en pocos KB.
export const VERTICAL_TEXT_SCALE: number = 4

// Alto de cada linea respecto de la letra: el "normal" de Arial y compañia.
export const VERTICAL_TEXT_LINE_HEIGHT: number = 1.2

// Aire en cada punta del texto, en px CSS: sin el, la primera y la ultima letra rozan el borde.
export const VERTICAL_TEXT_PADDING_PX: number = 2

// Cuantos PNG distintos se recuerdan. El lienzo pinta en cada cambio; sin esto dibujaria cada
// rotulo cada vez.
export const VERTICAL_TEXT_CACHE_LIMIT: number = 300
