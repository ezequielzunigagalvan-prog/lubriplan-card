import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PinScreen from './screens/PinScreen'
import EquiposScreen from './screens/EquiposScreen'
import CartaScreen from './screens/CartaScreen'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PinScreen />} />
        <Route path="/pin" element={<PinScreen />} />
        <Route path="/equipos" element={<EquiposScreen />} />
        <Route path="/carta/:id" element={<CartaScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
