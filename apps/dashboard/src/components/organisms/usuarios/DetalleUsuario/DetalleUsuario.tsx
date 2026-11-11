import { CheckCircle, Edit, Send, Trash, Warning } from 'reicon-react'
import { useState } from 'react'
import { etiquetaRol, nombreCompleto } from '../../../../lib/formato'
import { useSesion } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import { Badge, Boton } from '../../../atoms'
import { Aviso, Dato, Modal } from '../../../molecules'
import CamposUsuario, {
  datosDe,
  erroresUsuario,
  hayErrores,
  ROLES_1CERO1,
  ROLES_MUNICIPIO,
} from '../CamposUsuario'
import type { DatosUsuario } from '../CamposUsuario'
import type { DetalleUsuarioProps } from './types'

type Modo = 'ver' | 'editar' | 'eliminar'

/**
 * Los datos de un usuario en una ventana, con lo que se puede hacer con él: editar sus datos (por ejemplo, el correo
 * cuando el municipio pierde el acceso al que tenía), reenviarle las credenciales, desactivarlo o reactivarlo, y
 * eliminarlo después de confirmar. En la demo, los correos no salen de verdad.
 */
export default function DetalleUsuario({
  usuario: u,
  municipio,
  gestionable,
  cerrar,
}: DetalleUsuarioProps) {
  const { usuario: actual } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const guardarUsuario = useDatos((s) => s.guardarUsuario)
  const alternarUsuario = useDatos((s) => s.alternarUsuario)
  const eliminarUsuario = useDatos((s) => s.eliminarUsuario)
  const es1cero1 = actual?.rol === '1cero1'
  const [modo, setModo] = useState<Modo>('ver')
  const [datos, setDatos] = useState<DatosUsuario>(() => datosDe(u, municipios[0].id))
  const [intentado, setIntentado] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const editar = () => {
    setDatos(datosDe(u, municipios[0].id))
    setIntentado(false)
    setAviso(null)
    setModo('editar')
  }

  const guardar = () => {
    setIntentado(true)
    if (hayErrores(erroresUsuario(datos))) return
    const correo = datos.correo.trim()
    guardarUsuario({
      ...u,
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      cargo: datos.cargo.trim() || etiquetaRol[datos.rol],
      correo,
      rol: datos.rol,
      municipioId: datos.rol === '1cero1' ? null : es1cero1 ? datos.municipioId : u.municipioId,
    })
    setAviso(
      correo !== u.correo
        ? `Se guardaron los cambios. El correo ahora es ${correo}: reenvíale las credenciales para que pueda entrar.`
        : 'Se guardaron los cambios.',
    )
    setModo('ver')
  }

  const eliminar = () => {
    eliminarUsuario(u.id)
    cerrar()
  }

  const pie = !gestionable ? (
    <Boton onClick={cerrar}>Cerrar</Boton>
  ) : modo === 'editar' ? (
    <>
      <Boton onClick={() => setModo('ver')}>Cancelar</Boton>
      <Boton variante="primario" onClick={guardar}>
        Guardar cambios
      </Boton>
    </>
  ) : modo === 'eliminar' ? (
    <>
      <Boton onClick={() => setModo('ver')}>Cancelar</Boton>
      <Boton variante="peligro" onClick={eliminar}>
        <Trash className="size-4" aria-hidden /> Sí, eliminar
      </Boton>
    </>
  ) : (
    <>
      <Boton
        variante="fantasma"
        className="mr-auto text-red-600 hover:bg-red-50"
        onClick={() => setModo('eliminar')}
      >
        <Trash className="size-4" aria-hidden /> Eliminar
      </Boton>
      <Boton onClick={editar}>
        <Edit className="size-4" aria-hidden /> Editar
      </Boton>
      <Boton onClick={() => alternarUsuario(u.id)}>{u.activo ? 'Desactivar' : 'Reactivar'}</Boton>
      <Boton
        variante="primario"
        disabled={!u.activo}
        title={u.activo ? undefined : 'Reactívalo para poder reenviarle las credenciales'}
        onClick={() => setAviso(`Se enviaron las credenciales de acceso a ${u.correo}.`)}
      >
        <Send className="size-4" aria-hidden /> Reenviar credenciales
      </Boton>
    </>
  )

  return (
    <Modal
      titulo={modo === 'editar' ? 'Editar usuario' : nombreCompleto(u)}
      descripcion={modo === 'editar' ? nombreCompleto(u) : u.cargo}
      cerrar={cerrar}
      pie={pie}
    >
      {modo === 'editar' ? (
        <CamposUsuario
          datos={datos}
          cambiar={setDatos}
          mostrarErrores={intentado}
          roles={es1cero1 ? ROLES_1CERO1 : ROLES_MUNICIPIO}
          municipios={es1cero1 ? municipios : undefined}
        />
      ) : (
        <dl className="grid gap-4 sm:grid-cols-2">
          <Dato etiqueta="Nombres">{u.nombres}</Dato>
          <Dato etiqueta="Apellidos">{u.apellidos}</Dato>
          <Dato etiqueta="Cargo">{u.cargo}</Dato>
          <Dato etiqueta="Correo">
            <span className="break-all">{u.correo}</span>
          </Dato>
          <Dato etiqueta="Rol">
            <Badge tono={u.rol === '1cero1' ? 'info' : 'neutral'}>{etiquetaRol[u.rol]}</Badge>
          </Dato>
          <Dato etiqueta="Municipio">{municipio}</Dato>
          <Dato etiqueta="Estado">
            <Badge tono={u.activo ? 'exito' : 'neutral'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
          </Dato>
        </dl>
      )}

      <div className="mt-4 space-y-3 empty:hidden">
        {modo === 'ver' && !u.activo && gestionable && (
          <Aviso tono="neutral">No puede entrar al aplicativo mientras esté inactivo.</Aviso>
        )}
        {modo === 'ver' && aviso && (
          <Aviso tono="exito" icono={CheckCircle} rol="status">
            {aviso}
          </Aviso>
        )}
        {modo === 'eliminar' && (
          <Aviso tono="peligro" icono={Warning} rol="alert">
            <p className="font-medium">¿Eliminar a {nombreCompleto(u)}?</p>
            <p className="mt-0.5">
              No se puede deshacer. Si solo quieres quitarle el acceso, mejor desactívalo.
            </p>
          </Aviso>
        )}
        {!gestionable && (
          <Aviso tono="neutral">
            {u.id === actual?.id
              ? 'No puedes cambiar tu propio usuario.'
              : 'Solo 1cero1 puede cambiar a los usuarios de 1cero1.'}
          </Aviso>
        )}
      </div>
    </Modal>
  )
}
