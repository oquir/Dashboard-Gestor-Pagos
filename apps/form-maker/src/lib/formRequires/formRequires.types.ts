// core: esqueleto, nunca se declara. feature: se declara si trae algo. present: con solo aparecer
// (por allowsNegative, que viaja solo como false).
export type KeyRule = 'core' | 'feature' | 'present'

// Sobre todas las claves: una clave nueva sin clasificar no compila.
export type KeyTable<T> = Record<keyof T, KeyRule>
