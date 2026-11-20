// Lo que daba max-w-5xl (64rem) menos px-6 por lado.
export const DOCUMENT_MAX_WIDTH_PX: number = 976

// Con los dos paneles plegados: max-w-7xl (80rem) menos px-6 por lado.
export const DOCUMENT_MAX_WIDTH_FOCUSED_PX: number = 1180

// Aire minimo a cada lado del documento cuando el zoom lo hace mas ancho que la vista.
export const DOCUMENT_GUTTER_PX: number = 24

// Aire entre el borde de la vista y el del documento al volver al inicio, arriba y abajo.
export const DOCUMENT_VERTICAL_GUTTER_PX: number = 32

// Medio puerto por lado: el borde del documento llega al centro y el margen cubre lo que el zoom
// desborda por la izquierda ((W*k - W)/2 <= (puerto - 48)/4 con k <= 1.5).
export const CANVAS_PAN_ROOM_RATIO: number = 0.5
