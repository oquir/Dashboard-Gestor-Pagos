import type { ExportedFormSchema, ExportedSetupConfig, ExportedStep } from '../../types/exportForm'
import { FORM_SCHEMA_KEYS, SETUP_CONFIG_KEYS } from './formRequires.constants'
import { declareHelpers, declareKeys, declareStep } from './formRequires.utils'

// Lo que un consumidor tiene que saber hacer para ejecutar este formulario sin perder nada; viaja
// en projectMeta.requires y el consumidor rechaza lo que no reconoce. Una lista y no una version.
// Se calcula sobre el export armado.
// Palabras de clave (field.prefix) y de valor en lista cerrada (type:date, helper:uvt).

export function collectRequires(
  setupConfig: ExportedSetupConfig,
  formSchema: ExportedFormSchema,
): string[] {
  const words: Set<string> = new Set()

  declareKeys(words, 'setupConfig', setupConfig, SETUP_CONFIG_KEYS)
  declareKeys(words, 'formSchema', formSchema, FORM_SCHEMA_KEYS)

  // El preludio no va dentro de cada `compiled`, asi que sus helpers se buscan aparte.
  if (formSchema.prelude) declareHelpers(words, formSchema.prelude)

  // El modal de entrada corre en el mismo ambito que el formulario: lo que pida tambien cuenta.
  const steps: ExportedStep[] = [...(setupConfig.introModal?.steps ?? []), ...formSchema.steps]

  for (const step of steps) {
    declareStep(words, step)
  }

  // Ordenada: dos exports iguales dan la misma lista.
  return [...words].sort()
}
