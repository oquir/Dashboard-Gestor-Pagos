import type { ComponentType } from "react";
import { HelpCircle, Link, LinkOff } from "reicon-react";
import type { IconProps } from "../../../types/icon";
import type { FieldDestination } from "./CanvasFieldChip.types";

export const STATE_ICON_CLASSES: string = "flex shrink-0 items-center text-fg-subtle";

// La misma X que ya borra un step en el panel derecho: quien la vio una vez la reconoce aca. Hasta
// ahora borrar un campo solo se podia por clic derecho, que es un gesto que hay que adivinar.
export const DELETE_BUTTON_CLASSES: string =
  "absolute -right-1.5 -top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-surface text-fg-subtle shadow-sm transition-colors hover:cursor-pointer hover:border-danger-soft hover:text-danger";

// Si el campo viaja a la API, en la esquina de abajo a la derecha: cae en el margen que el chip ya
// reserva para el tirador de ancho, asi que no le quita lugar al contenido. La cadena es la misma
// de la pestana Mapeo API. Una franja de color en el borde izquierdo fue la primera version y
// pesaba demasiado: en ICA casi todo se envia, y el lienzo entero quedaba pintado.
export const DESTINATION_SYMBOL_CLASSES: string = "absolute bottom-1.5 right-1.5 flex items-center";

export const DESTINATION_ICONS: Partial<Record<FieldDestination, ComponentType<IconProps>>> = {
  sent: Link,
  internal: LinkOff,
  pending: HelpCircle,
};

// Dos colores y no tres: ambar el que se envia y gris todo lo demas, que se distingue por la forma
// (cadena tachada o signo de pregunta). Fue decision del usuario: el verde del principio decia
// "valido", que estar mapeado no garantiza, y el azul que lo reemplazo chillaba sobre el lienzo.
// Van de la paleta de Tailwind y no de los tokens de index.css (text-warning, text-fg-subtle), a
// pedido del usuario: esa paleta puede cambiar, y recolorear los avisos no tiene por que mover este
// simbolo. Hoy pintan lo mismo que esos dos tokens, en claro y en oscuro.
export const DESTINATION_COLOR_CLASSES: Partial<Record<FieldDestination, string>> = {
  sent: "text-brand dark:text-brand",
  internal: "text-slate-400 dark:text-neutral-500",
  pending: "text-slate-400 dark:text-neutral-500",
};

export const DESTINATION_TITLES: Record<Exclude<FieldDestination, "none">, string> = {
  sent: "Se envía a la API",
  internal: "No se envía a la API: es de uso interno del formulario",
  pending: "Falta decidir si se envía a la API (pestaña Mapeo API)",
};

export const BORDER_CLASSES: string =
  "border-slate-200 hover:border-slate-300 dark:border-neutral-700 dark:hover:border-neutral-600";

// Un poco mas oscuro que el normal: punteado y tan claro, el trazo casi no se veia.
export const INTERNAL_BORDER_CLASSES: string =
  "border-dashed border-slate-300 hover:border-slate-400 dark:border-neutral-600 dark:hover:border-neutral-500";

export const SELECTED_BORDER_CLASSES: string = "border-brand ring-1 ring-brand";
