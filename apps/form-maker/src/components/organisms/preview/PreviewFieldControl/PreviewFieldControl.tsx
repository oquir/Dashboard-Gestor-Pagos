import { fillsColumn } from '../../../../lib/catalogFill/catalogFill'
import { affixOf } from '../../../../lib/fieldAffix/fieldAffix'
import {
  dateFormatOf,
  dateInputMax,
  includesTime,
  isDateRangeField,
} from '../../../../lib/fieldDate/fieldDate'
import { maxLengthOf } from '../../../../lib/fieldLength/fieldLength'
import { showsOptionsInline } from '../../../../lib/fieldOptions/fieldOptions'
import { placeholderOf } from '../../../../lib/fieldPlaceholder/fieldPlaceholder'
import { catalogOptions } from '../../../../lib/mockCatalog/mockCatalog'
import type { CatalogOption } from '../../../../types/catalog'
import { RichTextView } from '../../../atoms/RichTextView/RichTextView'
import { PreviewAffixFrame } from '../PreviewAffixFrame/PreviewAffixFrame'
import { PreviewDatalistInput } from '../PreviewDatalistInput/PreviewDatalistInput'
import { PreviewDateInput } from '../PreviewDateInput/PreviewDateInput'
import { PreviewDateRangeInput } from '../PreviewDateRangeInput/PreviewDateRangeInput'
import { PreviewNumberInput } from '../PreviewNumberInput/PreviewNumberInput'
import { PreviewSearchSelect } from '../PreviewSearchSelect/PreviewSearchSelect'
import {
  CHIP_ACTIVE_CLASSES,
  CHIP_BASE_CLASSES,
  CHIP_IDLE_CLASSES,
  CONTROL_BASE_CLASSES,
  CONTROL_IDLE_CLASSES,
  CONTROL_INVALID_CLASSES,
  INLINE_OPTIONS_CLASSES,
  OPTION_ROW_CLASSES,
  STACKED_OPTIONS_CLASSES,
} from './PreviewFieldControl.constants'
import type { PreviewFieldControlProps } from './PreviewFieldControl.types'
import { toggleInList, toInputValue, toSelectedList } from './PreviewFieldControl.utils'

export function PreviewFieldControl({
  field,
  value,
  disabled,
  invalid,
  scopeValues,
  catalogBank,
  onChange,
}: PreviewFieldControlProps) {
  const controlClasses = `${CONTROL_BASE_CLASSES} ${invalid ? CONTROL_INVALID_CLASSES : CONTROL_IDLE_CLASSES}`
  const options: CatalogOption[] = catalogOptions(field, scopeValues, catalogBank)
  const inputId = `preview-${field.name}`
  const placeholder: string | undefined = placeholderOf(field)

  switch (field.type) {
    case 'rich_text':
      return <RichTextView content={field.content} />

    case 'label':
      return null

    case 'textarea':
      return (
        <textarea
          id={inputId}
          rows={3}
          maxLength={maxLengthOf(field)}
          placeholder={placeholder}
          disabled={disabled}
          value={toInputValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className={controlClasses}
        />
      )

    // Redondeo y formato al salir del campo: mientras se escribe harian imposible tipear. El
    // calculado va deshabilitado (sin blur): lo redondea runtimeDerived.
    case 'number':
    case 'calculated': {
      const prefix: string | undefined = affixOf(field, 'prefix')
      const suffix: string | undefined = affixOf(field, 'suffix')
      const numberInput = (className: string) => (
        <PreviewNumberInput
          field={field}
          value={value}
          disabled={disabled}
          inputId={inputId}
          className={className}
          onChange={onChange}
        />
      )

      // Sin afijos, el input de siempre.
      return prefix || suffix ? (
        <PreviewAffixFrame prefix={prefix} suffix={suffix} invalid={invalid}>
          {numberInput}
        </PreviewAffixFrame>
      ) : (
        numberInput(controlClasses)
      )
    }

    // El valor es lo escrito, se elija una sugerencia o no.
    case 'datalist':
      return (
        <PreviewDatalistInput
          inputId={inputId}
          suggestions={field.suggestions ?? []}
          value={toInputValue(value)}
          placeholder={placeholder}
          maxLength={maxLengthOf(field)}
          disabled={disabled}
          className={controlClasses}
          onChange={onChange}
        />
      )

    // Fuera de un <form> tel y email no validan; traen el teclado del celular. El formato lo valida
    // el schema.
    case 'tel':
    case 'email':
      return (
        <input
          id={inputId}
          type={field.type}
          autoComplete="off"
          maxLength={maxLengthOf(field)}
          placeholder={placeholder}
          disabled={disabled}
          value={toInputValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className={controlClasses}
        />
      )

    // El valor es el texto del input (AAAA-MM-DD, con hora AAAA-MM-DDTHH:mm): eso valida el schema
    // y viaja en el payload.
    case 'date':
      return isDateRangeField(field) ? (
        <PreviewDateRangeInput
          label={field.label}
          value={value}
          disabled={disabled}
          inputId={inputId}
          format={dateFormatOf(field)}
          withTime={includesTime(field)}
          max={dateInputMax(field)}
          className={controlClasses}
          onChange={onChange}
        />
      ) : (
        <PreviewDateInput
          id={inputId}
          format={dateFormatOf(field)}
          withTime={includesTime(field)}
          value={toInputValue(value)}
          max={dateInputMax(field)}
          disabled={disabled}
          className={controlClasses}
          onChange={onChange}
        />
      )

    case 'checkbox':
      return (
        <label className={OPTION_ROW_CLASSES}>
          <input
            type="checkbox"
            disabled={disabled}
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            className="accent-brand"
          />
          {field.title || 'Acepto'}
        </label>
      )

    case 'file':
      return (
        <input
          id={inputId}
          type="file"
          disabled={disabled}
          accept={field.fileConfig?.acceptedFormats.join(',')}
          onChange={(event) => onChange(event.target.files?.[0])}
          className={`${controlClasses} file:mr-2 file:rounded file:border-0 file:bg-surface-raised file:px-2 file:py-0.5 file:text-xs file:text-fg-soft`}
        />
      )

    // Para catalogos grandes: 425 actividades por 15 repeticiones eran 6.375 <option>. Ademas
    // muestra codigo, descripcion y tarifa en columnas.
    case 'search_select':
      return (
        <PreviewSearchSelect
          inputId={inputId}
          label={field.label}
          options={options}
          value={value}
          disabled={disabled}
          invalid={invalid}
          showsTarifa={fillsColumn(field, 'tarifa')}
          placeholder={placeholder}
          onChange={onChange}
        />
      )

    case 'select':
      return (
        <select
          id={inputId}
          disabled={disabled}
          value={toInputValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className={controlClasses}
        >
          <option value="">{placeholder ?? 'Seleccionar…'}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      )

    case 'toggle_group':
      return (
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(toInputValue(value) === option.id ? '' : option.id)}
              className={`${CHIP_BASE_CLASSES} ${
                toInputValue(value) === option.id ? CHIP_ACTIVE_CLASSES : CHIP_IDLE_CLASSES
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )

    case 'radio_group':
      return (
        <div
          className={showsOptionsInline(field) ? INLINE_OPTIONS_CLASSES : STACKED_OPTIONS_CLASSES}
        >
          {options.map((option) => (
            <label key={option.id} className={OPTION_ROW_CLASSES}>
              <input
                type="radio"
                name={field.name}
                disabled={disabled}
                checked={toInputValue(value) === option.id}
                onChange={() => onChange(option.id)}
                className="accent-brand"
              />
              {option.label}
            </label>
          ))}
        </div>
      )

    case 'checkbox_group': {
      const selected: string[] = toSelectedList(value)

      return (
        <div
          className={showsOptionsInline(field) ? INLINE_OPTIONS_CLASSES : STACKED_OPTIONS_CLASSES}
        >
          {options.map((option) => (
            <label key={option.id} className={OPTION_ROW_CLASSES}>
              <input
                type="checkbox"
                disabled={disabled}
                checked={selected.includes(option.id)}
                onChange={() => onChange(toggleInList(selected, option.id))}
                className="accent-brand"
              />
              {option.label}
            </label>
          ))}
        </div>
      )
    }

    default:
      return (
        <input
          id={inputId}
          type="text"
          maxLength={maxLengthOf(field)}
          placeholder={placeholder}
          disabled={disabled}
          value={toInputValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className={controlClasses}
        />
      )
  }
}
