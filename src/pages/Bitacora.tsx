import { Download } from 'reicon-react'
import { useMemo, useState } from 'react'
import { Navigate } from 'react-router'
import { Boton, Card } from '../components/atoms'
import { BarraFiltros, Buscador, Filtro, FiltroCasilla, PageHeader } from '../components/molecules'
import { BuscadorMunicipios, TablaBitacora } from '../components/organisms'
import { nombreMunicipio } from '../components/organisms/bitacora/TablaBitacora'
import { descargarBlob } from '../lib/archivos'
import { filtrarBitacora, fueraDeHorario } from '../lib/bitacora'
import { crearXlsx } from '../lib/excel'
import { etiquetaCategoriaBitacora, etiquetaRol, formatoHora } from '../lib/formato'
import { puede } from '../lib/permisos'
import { delMunicipio, useSesion } from '../lib/sesion'
import { useDatos } from '../store'
import type { CategoriaBitacora, Rol, ValorFiltro } from '../types'
import { hoy } from '../utils'

const OPCIONES_CATEGORIA: Record<ValorFiltro<CategoriaBitacora>, string> = { '': 'Toda categoría', ...etiquetaCategoriaBitacora }
const OPCIONES_ROL: Record<ValorFiltro<Rol>, string> = { '': 'Todo rol', ...etiquetaRol }

const COLUMNAS_EXCEL = [
  { titulo: 'Fecha', ancho: 12 },
  { titulo: 'Hora', ancho: 10 },
  { titulo: 'Usuario', ancho: 22 },
  { titulo: 'Rol', ancho: 24 },
  { titulo: 'Municipio', ancho: 24 },
  { titulo: 'Categoría', ancho: 16 },
  { titulo: 'Acción', ancho: 60 },
  { titulo: 'Antes', ancho: 30 },
  { titulo: 'Después', ancho: 40 },
  { titulo: 'Fuera de horario', ancho: 10 },
]

export default function Bitacora() {
  const { usuario, municipioId } = useSesion()
  const bitacora = useDatos((s) => s.bitacora)
  const municipios = useDatos((s) => s.municipios)
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState<ValorFiltro<CategoriaBitacora>>('')
  const [rol, setRol] = useState<ValorFiltro<Rol>>('')
  const [soloFueraDeHorario, setSoloFueraDeHorario] = useState(false)

  // Con un municipio elegido no salen los registros que no son de ninguno, como el inicio de sesión de 1cero1.
  const delQueSeVe = useMemo(() => delMunicipio(bitacora, municipioId), [bitacora, municipioId])
  const filtrados = useMemo(
    () => filtrarBitacora(delQueSeVe, { texto, categoria, rol, soloFueraDeHorario }),
    [delQueSeVe, texto, categoria, rol, soloFueraDeHorario],
  )

  if (!puede(usuario?.rol, 'verBitacora')) return <Navigate to="/" replace />

  const descargar = () => {
    const libro = crearXlsx({
      nombre: 'Bitácora',
      filas: [
        COLUMNAS_EXCEL.map((c) => c.titulo),
        ...filtrados.map((r) => [
          r.fechaHora.slice(0, 10),
          formatoHora(r.fechaHora),
          r.usuario.nombre,
          etiquetaRol[r.usuario.rol],
          nombreMunicipio(r, municipios),
          etiquetaCategoriaBitacora[r.categoria],
          r.accion,
          r.antes ?? '',
          r.despues ?? '',
          fueraDeHorario(r) ? 'Sí' : 'No',
        ]),
      ],
      anchos: COLUMNAS_EXCEL.map((c) => c.ancho),
    })
    descargarBlob(libro, `bitacora_${hoy()}.xlsx`)
  }

  return (
    <>
      <PageHeader
        titulo="Bitácora"
        descripcion="Quién hizo cada cambio en el aplicativo y cuándo, con el valor que tenía antes. Incluye lo que hace el equipo de 1cero1. Solo la ve 1cero1; en la demo son datos de prueba."
      />
      <BuscadorMunicipios />
      <Card>
        <BarraFiltros
          buscador={<Buscador placeholder="Buscar por usuario, acción o valor" value={texto} onChange={(e) => setTexto(e.target.value)} />}
          acciones={
            <Boton variante="primario" disabled={filtrados.length === 0} onClick={descargar}>
              <Download className="size-4" aria-hidden /> Descargar Excel
            </Boton>
          }
        >
          <Filtro etiqueta="Categoría" opciones={OPCIONES_CATEGORIA} valor={categoria} cambiar={setCategoria} />
          <Filtro etiqueta="Rol" opciones={OPCIONES_ROL} valor={rol} cambiar={setRol} />
          <FiltroCasilla etiqueta="Solo fuera de horario" marcado={soloFueraDeHorario} cambiar={setSoloFueraDeHorario} />
        </BarraFiltros>
        <TablaBitacora registros={filtrados} total={delQueSeVe.length} />
      </Card>
    </>
  )
}
