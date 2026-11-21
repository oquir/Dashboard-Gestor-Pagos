import { ACTION_TIER_CLASSES } from '../../../constants'
import type { PdfSaveStatus } from './PdfDesigner.types'

export const STATUS_DOT_CLASSES: Record<PdfSaveStatus['tone'], string> = {
  saved: 'bg-success',
  error: 'bg-danger',
  idle: 'bg-fg-subtle',
}

// Va en el <main> que hace scroll: las hojas del shadow root quedan inertes y heredan el cursor.
export const HAND_CURSOR_CLASSES: string = 'cursor-grab select-none active:cursor-grabbing'

// La escala de la cabecera, de mayor a menor peso (constants/actionTiers.ts): Subir es el unico
// relleno, Descargar HTML el secundario, Abrir y Volver terciarios, y el modo oscuro solo icono.
export const UPLOAD_BUTTON_CLASSES: string = ACTION_TIER_CLASSES.primary.regular

export const DOWNLOAD_BUTTON_CLASSES: string = ACTION_TIER_CLASSES.secondary.regular

export const OPEN_BUTTON_CLASSES: string = ACTION_TIER_CLASSES.tertiary.regular

export const BACK_BUTTON_CLASSES: string = ACTION_TIER_CLASSES.tertiary.regular

export const THEME_BUTTON_CLASSES: string = ACTION_TIER_CLASSES.quiet.icon
