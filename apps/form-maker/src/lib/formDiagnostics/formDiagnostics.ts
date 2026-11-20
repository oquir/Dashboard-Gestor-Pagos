import type { CanvasField } from '../../types/field'
import type { DiagnoseFormInput, FormProblem } from '../../types/formDiagnostics'
import { conceptOwners } from '../fieldConcept/fieldConcept'
import type { LocatedItems, PreludeCheck, ProblemDraft } from './formDiagnostics.types'
import {
  checkPrelude,
  conceptProblems,
  conditionPatternProblems,
  cycleProblems,
  fieldCssProblems,
  groupCheckProblems,
  locateItems,
  mappingProblems,
  patternProblems,
  rowCssProblems,
  scriptProblems,
} from './formDiagnostics.utils'

// Revision antes de exportar: junta lo que los editores avisan por separado y lo que nadie revisaba
// (regex de pattern y matches, scripts de efectos). Error: roto, bloquea. Aviso: puede ser a
// proposito. ⚠ tipo y cobertura quedan fuera a proposito. No arrastra nada del simulador.

export function diagnoseForm(input: DiagnoseFormInput): FormProblem[] {
  const items: LocatedItems = locateItems(input)
  // Los mismos nombres que buildFormExport: cada {{x}} se juzga como se va a compilar.
  const knownNames: Set<string> = new Set(items.fields.map((located) => located.field.name))
  const prelude: PreludeCheck = checkPrelude(input.formScript)
  const owners: Map<number, CanvasField[]> = conceptOwners(
    items.fields.map((located) => located.field),
  )

  const drafts: ProblemDraft[] = [
    ...prelude.problems,
    ...items.fields.flatMap((located) => [
      ...scriptProblems(located, knownNames, prelude.prelude),
      ...patternProblems(located),
      ...conditionPatternProblems(located),
      ...mappingProblems(located),
      ...conceptProblems(located, owners),
      ...fieldCssProblems(located),
    ]),
    ...items.rows.flatMap((located) => rowCssProblems(located)),
    ...items.groups.flatMap((located) => groupCheckProblems(located, knownNames, prelude.prelude)),
    ...cycleProblems(items.fields),
  ]

  // Errores primero; dentro de cada gravedad queda el orden del formulario.
  const ordered: ProblemDraft[] = [
    ...drafts.filter((draft) => draft.severity === 'error'),
    ...drafts.filter((draft) => draft.severity === 'warning'),
  ]

  return ordered.map((draft, index) => ({ ...draft, id: `problema-${index}` }))
}
