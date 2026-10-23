import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Actividades from './pages/Actividades'
import Configuracion from './pages/Configuracion'
import DeclaracionDetalle from './pages/DeclaracionDetalle'
import Declaraciones from './pages/Declaraciones'
import InscripcionDetalle from './pages/InscripcionDetalle'
import Inscripciones from './pages/Inscripciones'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Municipios from './pages/Municipios'
import Pagos from './pages/Pagos'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="rit" element={<Inscripciones />} />
          <Route path="rit/:id" element={<InscripcionDetalle />} />
          <Route path="declaraciones" element={<Declaraciones />} />
          <Route path="declaraciones/:id" element={<DeclaracionDetalle />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="actividades" element={<Actividades />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="municipios" element={<Municipios />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
