import { useApiMappingPanel } from '../../../../hooks/useApiMappingPanel/useApiMappingPanel'
import { isPresentationalField } from '../../../../lib/fieldKind/fieldKind'
import { allowsManualOptions, isOptionBasedField } from '../../../../lib/fieldOptions/fieldOptions'
import type { CanvasField } from '../../../../types/field'
import { ApiPathSelect } from '../../../molecules/ApiPathSelect/ApiPathSelect'
import { PanelSection } from '../../../molecules/PanelSection/PanelSection'
import { FieldOptionsModal } from '../../FieldOptionsModal/FieldOptionsModal'
import { FieldDataSourceEditor } from '../FieldDataSourceEditor/FieldDataSourceEditor'
import {
  DESTINATION_CHOICES,
  DESTINATION_DESCRIPTION,
  DESTINATION_ITEM_ACTIVE_CLASSES,
  DESTINATION_ITEM_BASE_CLASSES,
  DESTINATION_ITEM_INACTIVE_CLASSES,
  DESTINATION_TRACK_CLASSES,
  ERROR_CLASSES,
  EXCLUDED_HINT,
  HINT_CLASSES,
  NOTE_CLASSES,
  OPTIONS_DISCARD_HINT,
  PENDING_PATH_HINT,
  WARNING_CLASSES,
} from './ApiMappingPanel.constants'

export function ApiMappingPanel({ field }: { field: CanvasField }) {
  const {
    isExcluded,
    path,
    leaves,
    isOrphan,
    isHostPath,
    showTypeMismatch,
    resolvedType,
    group,
    awaitsGroupArrayPath,
    dataSourceCandidates,
    isAskingOptions,
    setIsAskingOptions,
    handleExcludedToggle,
    handleOptionsConfirm,
    handlePathChange,
  } = useApiMappingPanel({ field })

  if (isPresentationalField(field.type)) {
    return (
      <p className="text-xs text-fg-subtle">
        Este campo solo muestra contenido: no envía ningún valor, así que no se mapea al payload.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <PanelSection title="Envío a la API" description={DESTINATION_DESCRIPTION}>
        <fieldset aria-label="Si el campo se envía a la API" className={DESTINATION_TRACK_CLASSES}>
          {DESTINATION_CHOICES.map((choice) => {
            const isActive: boolean = choice.sends !== isExcluded

            return (
              <button
                key={choice.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  if (!isActive) handleExcludedToggle(!choice.sends)
                }}
                className={`${DESTINATION_ITEM_BASE_CLASSES} ${
                  isActive ? DESTINATION_ITEM_ACTIVE_CLASSES : DESTINATION_ITEM_INACTIVE_CLASSES
                }`}
              >
                {choice.label}
              </button>
            )
          })}
        </fieldset>

        {isExcluded && (
          <p className={HINT_CLASSES}>
            {EXCLUDED_HINT}
            {allowsManualOptions(field) && ` ${OPTIONS_DISCARD_HINT}`}
          </p>
        )}

        {!isExcluded && !path && !awaitsGroupArrayPath && (
          <p className={HINT_CLASSES}>{PENDING_PATH_HINT}</p>
        )}

        {!isExcluded && group !== null && (
          <p className={NOTE_CLASSES}>
            {awaitsGroupArrayPath
              ? `Este campo vive dentro del grupo repetible “${group.title}”. Elegí primero a qué arreglo del payload corresponde el grupo.`
              : `Este campo se envía una vez por cada ${group.title.toLowerCase()}, dentro de ${group.arrayPath}[].`}
          </p>
        )}

        {!isExcluded && !awaitsGroupArrayPath && (
          <>
            <ApiPathSelect
              path={path}
              leaves={leaves}
              isOrphan={isOrphan}
              isHostPath={isHostPath}
              onChange={handlePathChange}
            />

            {isHostPath && (
              <p className={ERROR_CLASSES}>
                Esta ruta la define el aplicativo que recibe el JSON, no el formulario. Reasigná o
                excluí el campo.
              </p>
            )}

            {isOrphan && (
              <p className={ERROR_CLASSES}>
                Esta ruta ya no existe en el objeto de la API. Reasigná o excluí el campo.
              </p>
            )}

            {showTypeMismatch && (
              <p className={WARNING_CLASSES}>
                El tipo del campo ({field.type}) no coincide con el tipo esperado en la API (
                {resolvedType}).
              </p>
            )}
          </>
        )}
      </PanelSection>

      {isOptionBasedField(field.type) && (
        <FieldDataSourceEditor field={field} candidates={dataSourceCandidates} />
      )}

      {isAskingOptions && (
        <FieldOptionsModal
          fieldTypeLabel={field.label}
          onConfirm={handleOptionsConfirm}
          onCancel={() => setIsAskingOptions(false)}
        />
      )}
    </div>
  )
}
