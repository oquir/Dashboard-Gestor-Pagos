import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/templates'
import AccountStatement from './pages/AccountStatement'
import Activities from './pages/Activities'
import AuditLog from './pages/AuditLog'
import AuditLogDetail from './pages/AuditLogDetail'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import DeclarationDetail from './pages/DeclarationDetail'
import Declarations from './pages/Declarations'
import RegistrationDetail from './pages/RegistrationDetail'
import Registrations from './pages/Registrations'
import Home from './pages/Home'
import Login from './pages/Login'
import Municipalities from './pages/Municipalities'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import Users from './pages/Users'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="rit" element={<Registrations />} />
          <Route path="rit/:id" element={<RegistrationDetail />} />
          <Route path="declaraciones" element={<Declarations />} />
          <Route path="declaraciones/:id" element={<DeclarationDetail />} />
          <Route
            path="estado-de-cuenta/:municipalityId/:documentType/:document"
            element={<AccountStatement />}
          />
          <Route path="pagos" element={<Payments />} />
          <Route path="reportes" element={<Reports />} />
          <Route path="actividades" element={<Activities />} />
          <Route path="calendario" element={<Calendar />} />
          <Route path="configuracion" element={<Settings />} />
          <Route path="usuarios" element={<Users />} />
          <Route path="municipios" element={<Municipalities />} />
          <Route path="bitacora" element={<AuditLog />} />
          <Route path="bitacora/:id" element={<AuditLogDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
