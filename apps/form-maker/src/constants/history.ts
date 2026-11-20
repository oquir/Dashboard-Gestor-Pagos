// Cada paso son referencias compartidas: cien cuestan poco mas que uno.
export const HISTORY_LIMIT: number = 100

// Cambios mas juntos que esto son una rafaga y se deshacen de una vez. La ventana se corre con cada
// cambio.
export const HISTORY_BURST_MS: number = 500
