import { suggestionsOf, suggestionsText } from "../../../../lib/fieldSuggestions/fieldSuggestions";
import { useFormStore } from "../../../../store/formStore";
import { Textarea } from "../../../atoms/TextArea/Textarea";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import {
  COUNT_CLASSES,
  SUGGESTIONS_DESCRIPTION,
  SUGGESTIONS_EXAMPLE,
  SUGGESTIONS_HINT,
} from "./SuggestionsEditor.constants";
import type { SuggestionsEditorProps } from "./SuggestionsEditor.types";

export function SuggestionsEditor({ field }: SuggestionsEditorProps) {
  const setFieldSuggestions = useFormStore((state) => state.setFieldSuggestions);
  const count: number = suggestionsOf(field)?.length ?? 0;

  return (
    <PanelSection
      title="Sugerencias"
      description={SUGGESTIONS_DESCRIPTION}
      aside={<span className={COUNT_CLASSES}>{count}</span>}
    >
      <Textarea
        id="field-suggestions"
        aria-label="Sugerencias, una por línea"
        value={suggestionsText(field)}
        onChange={(event) => setFieldSuggestions(field.id, event.target.value)}
        placeholder={SUGGESTIONS_EXAMPLE}
        rows={6}
      />
      <p className="text-xs text-fg-subtle">{SUGGESTIONS_HINT}</p>
    </PanelSection>
  );
}
