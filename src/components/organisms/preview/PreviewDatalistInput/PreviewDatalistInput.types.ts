export interface PreviewDatalistInputProps {
  inputId: string;
  // Ya limpias: llegan del export, sin vacias ni repetidas.
  suggestions: string[];
  value: string;
  placeholder: string | undefined;
  maxLength: number | undefined;
  disabled: boolean;
  // Las clases las arma PreviewFieldControl, que ya sabe si el campo esta en rojo.
  className: string;
  onChange: (value: string) => void;
}
