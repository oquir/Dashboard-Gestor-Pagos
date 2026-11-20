// Punto de miles y coma decimal; el formateador y el parser leen las mismas.
export const GROUP_SEPARATOR: string = '.'

export const DECIMAL_SEPARATOR: string = ','

// Tope de decimales al mostrar: corta la cola de la coma flotante (0,30000000000000004).
export const MAX_DISPLAY_DECIMALS: number = 4

// Arriba de 1e21 toFixed usa notacion exponencial.
export const MAX_FORMATTABLE: number = 1e21
