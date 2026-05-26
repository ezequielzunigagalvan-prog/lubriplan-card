import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PinScreen from './screens/PinScreen'
import AreasScreen from './screens/AreasScreen'
import EquiposScreen from './screens/EquiposScreen'
import CartaScreen from './screens/CartaScreen'
import { AdminProvider } from './admin/context/AdminContext'
import ProtectedRoute from './admin/components/ProtectedRoute'
import LoginAdmin from './admin/screens/LoginAdmin'
import DashboardAdmin from './admin/screens/DashboardAdmin'
import ListaEquipos from './admin/screens/ListaEquipos'
import FormEquipo from './admin/screens/FormEquipo'
import EditorCarta from './admin/screens/EditorCarta'
import GestionTecnicos from './admin/screens/GestionTecnicos'
import GestionLubricantes from './admin/screens/GestionLubricantes'

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <Routes>
          {/* Técnico routes */}
          <Route path="/" element={<PinScreen />} />
          <Route path="/pin" element={<PinScreen />} />
          <Route path="/areas" element={<AreasScreen />} />
          <Route path="/equipos" element={<EquiposScreen />} />
          <Route path="/carta/:id" element={<CartaScreen />} />

          {/* Admin routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardAdmin /></ProtectedRoute>} />
          <Route path="/admin/equipos" element={<ProtectedRoute><ListaEquipos /></ProtectedRoute>} />
          <Route path="/admin/equipos/nuevo" element={<ProtectedRoute><FormEquipo /></ProtectedRoute>} />
          <Route path="/admin/equipos/:id/editar" element={<ProtectedRoute><FormEquipo /></ProtectedRoute>} />
          <Route path="/admin/equipos/:id/carta" element={<ProtectedRoute><EditorCarta /></ProtectedRoute>} />
          <Route path="/admin/tecnicos" element={<ProtectedRoute><GestionTecnicos /></ProtectedRoute>} />
          <Route path="/admin/lubricantes" element={<ProtectedRoute><GestionLubricantes /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminProvider>
    </BrowserRouter>
  )
}
