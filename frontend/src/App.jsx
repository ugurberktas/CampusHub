import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import StudentRegisterPage from './pages/StudentRegisterPage'
import ClubRegisterPage from './pages/ClubRegisterPage'
import SKSPanel from './pages/SKSPanel'

// Require authentication — redirect to /login if not logged in
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Yükleniyor...</p>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" replace />
}

// Redirect already-logged-in users away from auth pages
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Yükleniyor...</p>
      </div>
    )
  }
  
  return user ? <Navigate to="/sks-panel" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><StudentRegisterPage /></PublicRoute>} />
          <Route path="/register-club" element={<PublicRoute><ClubRegisterPage /></PublicRoute>} />

          {/* Protected app routes */}
          <Route path="/sks-panel" element={<PrivateRoute><SKSPanel /></PrivateRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
