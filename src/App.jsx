import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ContractForm from './pages/ContractForm'
import ProtectedRoute from './components/ProtectedRoute'
import ContractDetail from './pages/ContractDetail'

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts/new"
        element={
          <ProtectedRoute>
            <ContractForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts/:id/edit"
        element={
          <ProtectedRoute>
            <ContractForm />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route
        path="/contracts/:id"
        element={
          <ProtectedRoute>
            <ContractDetail />
          </ProtectedRoute>
        }
    />
    </Routes>
  )
}

export default App