import { Download } from 'reicon-react'
import { useMemo, useState } from 'react'
import { Navigate } from 'react-router'
import { Boton, Card } from '../components/atoms'
import { BarraFiltros, Buscador, Filtro, FiltroCasilla, PageHeader } from '../components/molecules'
import { BuscadorMunicipios, TablaBitacora } from '../components/organisms'
import { nombreMunicipio, textoResultado } from '../components/organisms/bitacora/TablaBitacora'
import { CONTROLADORES } from '../constants'
import { descargarBlob } from '../lib/archivos'
import { datosEnTexto, filtrarBitacora, fueraDeHorario } from '../lib/bitacora'
import { crearXlsx } from '../lib/excel'
import { etiquetaRol, formatoHora } from '../lib/formato'
import { puede } from '../lib/permisos'
import { delMunicipio, useSesion } from '../lib/sesion'
import { useDatos } from '../store'
import type { Rol, ValorFiltro } from '../types'
import { hoy } from '../utils'

const OPCIONES_CONTROLADOR: Record<string, string> = {
  '': 'Todo controlador',
  ...Object.fromEntries(CONTROLADORES.map((c) => [c, c])),
}
const OPCIONES_ROL: Record<ValorFiltro<Rol>, string> = { '': 'Todo rol', ...etiquetaRol }

/** Lo más que cabe en una celda de Excel. */
const LIMITE_CELDA = 32_767

const COLUMNAS_EXCEL = [
  { titulo: 'N.º', ancho: 8 },
  { titulo: 'Fecha', ancho: 12 },
  { titulo: 'Hora', ancho: 10 },
  { titulo: 'Usuario', ancho: 22 },
  { titulo: 'Rol', ancho: 24 },
  { titulo: 'Municipio', ancho: 24 },
  { titulo: 'Controlador', ancho: 16 },
  { titulo: 'Acción', ancho: 28 },
  { titulo: 'Endpoint', ancho: 44 },
  { titulo: 'Resultado', ancho: 12 },
  { titulo: 'Datos enviados', ancho: 80 },
  { titulo: 'Fuera de horario', ancho: 10 },
]

export default function Bitacora() {
  const { usuario, municipioId } = useSesion()
  const bitacora = useDatos((s) => s.bitacora)
  const municipios = useDatos((s) => s.municipios)
  const [texto, setTexto] = useState('')
  const [controlador, setControlador] = useState('')
  const [rol, setRol] = useState<ValorFiltro<Rol>>('')
  const [soloFueraDeHorario, setSoloFueraDeHorario] = useState(false)
  const [soloFallidas, setSoloFallidas] = useState(false)

  // Con un municipio elegido no salen los registros que no son de ninguno, como el inicio de sesión de 1cero1.
  const delQueSeVe = useMemo(() => delMunicipio(bitacora, municipioId), [bitacora, municipioId])
  const filtrados = useMemo(
    () =>
      filtrarBitacora(delQueSeVe, { texto, controlador, rol, soloFueraDeHorario, soloFallidas }),
    [delQueSeVe, texto, controlador, rol, soloFueraDeHorario, soloFallidas],
  )

  if (!puede(usuario?.rol, 'verBitacora')) return <Navigate to="/" replace />

  const descargar = () => {
    const libro = crearXlsx({
      nombre: 'Bitácora',
      filas: [
        COLUMNAS_EXCEL.map((c) => c.titulo),
        ...filtrados.map((r) => [
          r.id,
          r.fechaHora.slice(0, 10),
          formatoHora(r.fechaHora),
          r.usuario.nombre,
          etiquetaRol[r.usuario.rol],
          nombreMunicipio(r, municipios),
          r.controlador,
          r.accion,
          r.endpoint,
          textoResultado(r),
          datosEnTexto(r).slice(0, LIMITE_CELDA),
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
        descripcion="Las peticiones que cambiaron algo en el aplicativo: quién y cuándo, la acción, el endpoint, los datos que se enviaron y si salió bien. No guarda el valor que había antes. Incluye lo que hace el equipo de 1cero1 y solo la ve 1cero1. En la demo trae datos de prueba y lo que se hace en el navegador."
      />
      <BuscadorMunicipios />
      <Card>
        <BarraFiltros
          buscador={
            <Buscador
              placeholder="Buscar por número, usuario, acción, endpoint o datos"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          }
          acciones={
            <Boton variante="primario" disabled={filtrados.length === 0} onClick={descargar}>
              <Download className="size-4" aria-hidden /> Descargar Excel
            </Boton>
          }
        >
          <Filtro
            etiqueta="Controlador"
            opciones={OPCIONES_CONTROLADOR}
            valor={controlador}
            cambiar={setControlador}
          />
          <Filtro etiqueta="Rol" opciones={OPCIONES_ROL} valor={rol} cambiar={setRol} />
          <FiltroCasilla
            etiqueta="Solo fuera de horario"
            marcado={soloFueraDeHorario}
            cambiar={setSoloFueraDeHorario}
          />
          <FiltroCasilla
            etiqueta="Solo las que fallaron"
            marcado={soloFallidas}
            cambiar={setSoloFallidas}
          />
        </BarraFiltros>
        <TablaBitacora registros={filtrados} total={delQueSeVe.length} />
      </Card>
    </>
  )
}
