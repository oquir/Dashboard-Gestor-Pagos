import { isPresentationalField } from "../../../lib/fieldKind/fieldKind";
import type { CanvasField } from "../../../types/field";
import {
  BORDER_CLASSES,
  DESTINATION_TITLES,
  INTERNAL_BORDER_CLASSES,
  SELECTED_BORDER_CLASSES,
} from "./CanvasFieldChip.constants";
import type { FieldDestination } from "./CanvasFieldChip.types";

export function getChipPaddingClasses(isCompact: boolean, isUltraCompact: boolean): string {
  if (isUltraCompact) return "pl-1 pr-1";
  if (isCompact) return "pl-6 pr-5";
  return "pl-8 pr-8";
}

// Sin apiBinding es como nace todo campo soltado desde la paleta: todavia nadie decidio si viaja.
export function getFieldDestination(field: CanvasField): FieldDestination {
  if (isPresentationalField(field.type)) return "none";
  if (!field.apiBinding) return "pending";

  return field.apiBinding.kind === "mapped" ? "sent" : "internal";
}

export function getDestinationTitle(field: CanvasField, destination: FieldDestination): string {
  if (destination === "none") return "";
  if (destination === "sent" && field.apiBinding?.kind === "mapped") {
    return `${DESTINATION_TITLES.sent} en ${field.apiBinding.path}`;
  }

  return DESTINATION_TITLES[destination];
}

export function getChipBorderClasses(selected: boolean, destination: FieldDestination): string {
  if (destination !== "internal") return selected ? SELECTED_BORDER_CLASSES : BORDER_CLASSES;

  return selected ? `${SELECTED_BORDER_CLASSES} border-dashed` : INTERNAL_BORDER_CLASSES;
}
