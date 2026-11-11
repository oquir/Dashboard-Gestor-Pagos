import { Location } from 'reicon-react'
import { useNavigate } from 'react-router'
import { formatoCompacto } from '../../../../lib/formato'
import { useDatos } from '../../../../store'
import { Badge, Boton, Card } from '../../../atoms'
import { Cifra } from '../../../molecules'
import type { EncabezadoMunicipioProps } from './types'

/** El municipio elegido: dónde está, su estado, sus cifras y el acceso a su tablero. */
export default function EncabezadoMunicipio({ municipio: m, cifras: c }: EncabezadoMunicipioProps) {
  const alternarMunicipio = useDatos((s) => s.alternarMunicipio)
  const navigate = useNavigate()

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{m.nombre}</h2>
            <Badge tono={m.activo ? 'exito' : 'neutral'}>{m.activo ? 'Activo' : 'Inactivo'}</Badge>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <Location className="size-3.5" aria-hidden /> {m.departamento} · DANE {m.codigoDane}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Boton variante="secundario" onClick={() => navigate('/')}>
            Ver tablero
          </Boton>
          <Boton variante="fantasma" onClick={() => alternarMunicipio(m.id)}>
            {m.activo ? 'Desactivar' : 'Activar'}
          </Boton>
        </div>
      </div>
      {!m.activo && <p className="mt-3 text-sm text-slate-500">Mientras esté inactivo, sus usuarios no pueden entrar al aplicativo.</p>}
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
        <Cifra etiqueta="Inscripciones activas">{m.rit ? c.activas : <span className="text-sm font-normal text-slate-500">Sin RIT</span>}</Cifra>
        <Cifra etiqueta="Declaraciones">{c.declaraciones}</Cifra>
        <Cifra etiqueta="Recaudo 2026">${formatoCompacto(c.recaudo)}</Cifra>
        <Cifra etiqueta="Usuarios activos">{c.usuarios}</Cifra>
      </dl>
    </Card>
  )
}
