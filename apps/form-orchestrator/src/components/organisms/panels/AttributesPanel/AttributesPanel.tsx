import { RICH_TEXT_FIELD_TYPE } from '../../../../constants'
import { GRID_BASE_COLUMNS } from '../../../../constants'
import { findLabelFor, isPresentationalField, labelTargetCandidates } from '../../../../lib'
import { allowsManualOptions, isOptionBasedField, supportsInlineOptions } from '../../../../lib'
import { supportsRounding } from '../../../../lib'
import { supportsTooltip } from '../../../../lib'
import { getFreeRuns, getMaxSpanAt } from '../../../../lib'
import {
  findRowContainingField,
  getActiveRows,
  getAllFields,
  useFormStore,
} from '../../../../store'
import type { CanvasField } from '../../../../types'
import { ToggleSwitch } from '../../../atoms'
import { FieldIdentityCard } from '../../../molecules'
import { FieldNameInput } from '../../../molecules'
import { LabeledInput } from '../../../molecules'
import { LabeledRangeSlider } from '../../../molecules'
import { LabelTargetSelect } from '../../../molecules'
import { PanelSection } from '../../../molecules'
import { RichTextEditor } from '../../../molecules'
import { CatalogFillsEditor } from '../CatalogFillsEditor'
import { FieldOptionsEditor } from '../FieldOptionsEditor'
import { FieldTooltipEditor } from '../FieldTooltipEditor'
import { FileOptionsEditor } from '../FileOptionsEditor'
import { NumberOptionsEditor } from '../NumberOptionsEditor'
import { SOURCE_BADGE_CLASSES, SOURCE_LINK_CLASSES } from './AttributesPanel.constants'

export function AttributesPanel({ field }: { field: CanvasField }) {
  const updateField = useFormStore((state) => state.updateField)
  const setSidebarTab = useFormStore((state) => state.setSidebarTab)
  const setFieldLabelFor = useFormStore((state) => state.setFieldLabelFor)
  const setFieldContent = useFormStore((state) => state.setFieldContent)
  const setFieldInlineOptions = useFormStore((state) => state.setFieldInlineOptions)
  const activeRows = useFormStore(getActiveRows)
  const row = useFormStore((state) => findRowContainingField(state, field.id))
  const rowColumns = row?.columns ?? GRID_BASE_COLUMNS
  const maxSpan = row
    ? getMaxSpanAt(getFreeRuns(row.fields, row.columns, field.id), field.colStart)
    : rowColumns
  const isOptionBased: boolean = isOptionBasedField(field.type)
  const canEditOptions: boolean = allowsManualOptions(field)
  const isPresentational: boolean = isPresentationalField(field.type)
  const isRichText: boolean = field.type === RICH_TEXT_FIELD_TYPE
  const linkedLabel = findLabelFor(getAllFields(activeRows), field.id)
  const labelFieldLabel: string = isRichText
    ? 'Nombre del bloque'
    : isPresentational
      ? 'Texto'
      : 'Etiqueta'

  return (
    <div className="flex flex-col gap-3">
      <FieldIdentityCard field={field} linkedLabel={linkedLabel} />

      <PanelSection title="General">
        <div className="flex flex-col gap-1">
          <LabeledInput
            id="field-label"
            label={labelFieldLabel}
            value={linkedLabel ? linkedLabel.label : field.label}
            disabled={linkedLabel !== null}
            onChange={(event) => updateField(field.id, { label: event.target.value })}
          />
          {linkedLabel && (
            <span className="text-[11px] text-fg-subtle">
              La aporta la etiqueta ligada. Editála seleccionando ese campo en el lienzo.
            </span>
          )}
        </div>

        {isRichText && (
          <RichTextEditor
            key={field.id}
            value={field.content}
            onChange={(content) => setFieldContent(field.id, content)}
          />
        )}

        {isPresentational && !isRichText && (
          <LabelTargetSelect
            value={field.labelFor}
            candidates={labelTargetCandidates(getAllFields(activeRows), field.id)}
            onChange={(targetFieldId) => setFieldLabelFor(field.id, targetFieldId)}
          />
        )}

        <FieldNameInput key={field.id} field={field} />
      </PanelSection>

      <PanelSection
        title="Diseño"
        aside={
          <span className="text-[11px] tabular-nums text-fg-muted">
            {field.colSpan} / {rowColumns} · desde col {field.colStart}
          </span>
        }
      >
        <LabeledRangeSlider
          id="field-colspan"
          label="Ancho en columnas"
          min={1}
          max={maxSpan}
          value={field.colSpan}
          onChange={(value) => updateField(field.id, { colSpan: value })}
          minLabel="1 col"
          maxLabel={`${maxSpan} col`}
        />

        {supportsInlineOptions(field.type) && (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-fg">Opciones en una línea</span>
              <ToggleSwitch
                checked={Boolean(field.inlineOptions)}
                onChange={(checked) => setFieldInlineOptions(field.id, checked)}
                label="Dibujar las opciones en una sola línea"
              />
            </div>
            <p className="text-[10px] text-fg-subtle">
              Las pone una al lado de otra en vez de una debajo de otra, para que el renglón entre
              en un solo alto. Es solo presentación: no cambia el valor ni cuántas se pueden elegir.
            </p>
          </>
        )}
      </PanelSection>

      {canEditOptions && <FieldOptionsEditor field={field} />}

      {isOptionBased && !canEditOptions && (
        <PanelSection
          title="Origen de opciones"
          aside={
            <span className={SOURCE_BADGE_CLASSES}>
              {field.dataSource ? 'Catálogo' : 'Base de datos'}
            </span>
          }
        >
          <p className="text-xs text-fg-muted">
            {field.dataSource ? (
              <>
                Las carga el aplicativo consultando el catálogo{' '}
                <code className="font-mono text-fg">{field.dataSource.catalog}</code>. Para
                definirlas a mano hay que quitar ese catálogo.
              </>
            ) : (
              'Las carga el aplicativo según la ruta mapeada. Si este campo no sale de un catálogo, marcálo como excluido del payload y vas a poder definirlas a mano.'
            )}
          </p>

          <button
            type="button"
            onClick={() => setSidebarTab('apiMapping')}
            className={SOURCE_LINK_CLASSES}
          >
            Ir a Mapeo API →
          </button>

          {field.dataSource && <CatalogFillsEditor field={field} />}
        </PanelSection>
      )}

      {field.type === 'file' && <FileOptionsEditor field={field} />}

      {supportsRounding(field.type) && <NumberOptionsEditor field={field} />}

      {supportsTooltip(field.type) && <FieldTooltipEditor field={field} />}
    </div>
  )
}
