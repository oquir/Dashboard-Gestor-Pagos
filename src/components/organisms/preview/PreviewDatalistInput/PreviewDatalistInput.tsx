import { useId } from "react";
import type { PreviewDatalistInputProps } from "./PreviewDatalistInput.types";

// El id de la lista sale de useId y no del nombre del campo: adentro de un grupo repetible cada
// repeticion dibuja el mismo campo, y con el nombre las listas quedarian con el id repetido.
export function PreviewDatalistInput({
  inputId,
  suggestions,
  value,
  placeholder,
  maxLength,
  disabled,
  className,
  onChange,
}: PreviewDatalistInputProps) {
  const listId: string = useId();

  return (
    <>
      <input
        id={inputId}
        type="text"
        list={listId}
        autoComplete="off"
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      />
      <datalist id={listId}>
        {suggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </>
  );
}
