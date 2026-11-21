import { FILE_ERROR_BOX_CLASSES, FILE_SUMMARY_BOX_CLASSES } from '../../../constants'
import { FieldRenameNotice } from '../FieldRenameNotice'
import { FileChooser } from '../FileChooser'
import { FILE_ACCEPT } from './ProjectFilePicker.constants'
import type { ProjectFilePickerProps } from './ProjectFilePicker.types'
import { summaryLine } from './ProjectFilePicker.utils'

export function ProjectFilePicker({
  fileName,
  result,
  summary,
  isReading,
  onPick,
}: ProjectFilePickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-600 dark:text-neutral-300">
        Elige el JSON que se descargó con <strong>Exportar</strong>: trae el formulario completo,
        listo para seguir editándolo.
      </p>

      <FileChooser
        accept={FILE_ACCEPT}
        ariaLabel="Archivo JSON exportado"
        status={isReading ? 'Leyendo…' : (fileName ?? 'Ningún archivo elegido')}
        onPick={(files) => onPick(files[0])}
      />

      {result?.status === 'error' && <p className={FILE_ERROR_BOX_CLASSES}>{result.message}</p>}

      {summary && (
        <div className={FILE_SUMMARY_BOX_CLASSES}>
          <p className="text-sm font-medium text-slate-800 dark:text-neutral-100">
            {summary.formTypeLabel}
          </p>
          <p className="text-xs text-slate-500 dark:text-neutral-400">{summaryLine(summary)}</p>
          <p className="text-xs text-fg-muted">
            Exportado el {new Date(summary.savedAt).toLocaleString()}
          </p>
        </div>
      )}

      {result?.status === 'ok' && <FieldRenameNotice renamed={result.renamed} />}

      <p className="text-[11px] text-fg-muted">
        Abre solo archivos de personas de confianza: sus scripts se ejecutan en el simulador.
      </p>
    </div>
  )
}
