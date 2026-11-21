import { GRID_BASE_COLUMNS } from '../../constants/grid'
import type {
  ExportedFormSchema,
  ExportedSetupConfig,
  FormExport,
  FormExportFile,
} from '../../types/exportForm'
import type { CanvasRow, FormStep, IntroModalStep } from '../../types/formStructure'
import type { SetupConfig } from '../../types/setup'
import { collectRequires } from '../formRequires/formRequires'
import { buildDraftPayload } from '../persistence/persistence'
import { buildNameIndex, mapFormStep, mapRows } from './exportForm.utils'

// El JSON que se lleva el consumidor: lo que no salga de aca no existe para el aplicativo.

export function buildFormExport(
  formSteps: FormStep[],
  setupConfig: SetupConfig,
  introModalSteps: IntroModalStep[],
  formScript: string,
): FormExport {
  // Indice de los dos lienzos: hacia afuera un campo se identifica por su nombre, nunca por su
  // uuid.
  const allRows: CanvasRow[] = [
    ...formSteps.flatMap((step) => step.rows),
    ...introModalSteps.flatMap((step) => step.rows),
  ]
  const names: Map<string, string> = buildNameIndex(allRows)
  // Los nombres existentes, para que el compilador decida que {{x}} es un campo; se arma una vez.
  const knownNames: Set<string> = new Set(names.values())
  const prelude: string = formScript.trim()

  const exportedSetup: ExportedSetupConfig = {
    hasIntroModal: setupConfig.hasIntroModal,
    introModal: setupConfig.hasIntroModal
      ? {
          steps: introModalSteps.map((step) => ({
            stepId: step.stepId,
            title: step.title,
            subtitle: step.subtitle || undefined,
            rows: mapRows(step.rows, names, knownNames),
          })),
        }
      : undefined,
  }
  const formSchema: ExportedFormSchema = {
    gridBaseColumns: GRID_BASE_COLUMNS,
    prelude: prelude.length > 0 ? prelude : undefined,
    steps: formSteps.map((step) => mapFormStep(step, names, knownNames)),
  }

  return {
    projectMeta: {
      formId: `frm_${Date.now()}`,
      formType: setupConfig.formType,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      // Al final: juzga lo que de verdad viaja.
      requires: collectRequires(exportedSetup, formSchema),
    },
    setupConfig: exportedSetup,
    formSchema,
  }
}

// El archivo que se descarga y el que se sube: el contrato mas la copia del borrador para reabrir el
// proyecto (lo compilado no alcanza para reeditar). El simulador y la vista JSON no la traen.
export function buildFormExportFile(
  formSteps: FormStep[],
  setupConfig: SetupConfig,
  introModalSteps: IntroModalStep[],
  formScript: string,
): FormExportFile {
  return {
    ...buildFormExport(formSteps, setupConfig, introModalSteps, formScript),
    builderDraft: buildDraftPayload({
      formSteps,
      introModal: { steps: introModalSteps },
      formScript,
      setupConfig,
    }),
  }
}

export function downloadFormExport(
  formSteps: FormStep[],
  setupConfig: SetupConfig,
  introModalSteps: IntroModalStep[],
  formScript: string,
): void {
  const data: FormExportFile = buildFormExportFile(
    formSteps,
    setupConfig,
    introModalSteps,
    formScript,
  )
  const blob: Blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor: HTMLAnchorElement = document.createElement('a')
  anchor.href = url
  anchor.download = `${data.projectMeta.formId}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}
