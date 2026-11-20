import { ADD_LINK_CLASSES, PANEL_DANGER_LINK_CLASSES, PDF_MAX_SIGNERS } from '../../../../constants'
import type { PdfSigner } from '../../../../types'
import { PdfNumberField } from '../PdfNumberField'
import { PdfTextField } from '../PdfTextField'
import type { PdfSignaturesFieldsProps } from './PdfSignaturesFields.types'
import { NEW_SIGNER } from './PdfSignaturesFields.constants'

// Quienes firman, uno por columna: el titulo va bajo la raya y los detalles debajo, una linea por
// renglon y con {variables} donde haga falta. Hasta tres (declarante, contador y revisor fiscal).
export function PdfSignaturesFields({ component, onChange }: PdfSignaturesFieldsProps) {
  function updateSigner(index: number, patch: Partial<PdfSigner>): void {
    onChange({
      ...component,
      signers: component.signers.map((signer, i) =>
        i === index ? { ...signer, ...patch } : signer,
      ),
    })
  }

  return (
    <>
      <PdfNumberField
        id="pdf-signatures-space"
        label="Espacio para firmar"
        value={component.space}
        min={0}
        suffix="px"
        onChange={(value) => onChange({ ...component, space: value ?? 0 })}
      />
      {component.signers.map((signer, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-md border border-border p-2 dark:bg-black/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
              Firma {index + 1}
            </span>
            {component.signers.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...component,
                    signers: component.signers.filter((_, i) => i !== index),
                  })
                }
                className={PANEL_DANGER_LINK_CLASSES}
              >
                Quitar
              </button>
            )}
          </div>
          <PdfTextField
            id={`pdf-signer-title-${index}`}
            label="Título bajo la raya"
            value={signer.title}
            onChange={(title) => updateSigner(index, { title })}
          />
          <PdfTextField
            id={`pdf-signer-details-${index}`}
            label="Debajo (un renglón por línea)"
            value={signer.details}
            multiline
            placeholder={'NOMBRE: {Representante}\nC.C. No. {DocRepresentante}'}
            onChange={(details) => updateSigner(index, { details })}
          />
        </div>
      ))}
      {component.signers.length < PDF_MAX_SIGNERS && (
        <button
          type="button"
          onClick={() =>
            onChange({ ...component, signers: [...component.signers, { ...NEW_SIGNER }] })
          }
          className={`${ADD_LINK_CLASSES} self-start`}
        >
          + Otra firma
        </button>
      )}
    </>
  )
}
