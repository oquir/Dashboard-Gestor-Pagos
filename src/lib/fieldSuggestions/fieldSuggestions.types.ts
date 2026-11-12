// Lo minimo para leer las sugerencias, estructural para que entren CanvasField y ExportedField
// sin que esta carpeta conozca ninguno.
export interface SuggestionsField {
  type: string;
  suggestions?: string[];
}
