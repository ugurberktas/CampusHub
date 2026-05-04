import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import StudentRegisterPage from './pages/StudentRegisterPage'
import ClubRegisterPage from './pages/ClubRegisterPage'
import SKSPanel from './pages/SKSPanel'

// ─── Loading spinner shared between guards ────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Yükleniyor...</p>
    </div>
  )
}

// ─── PrivateRoute ─────────────────────────────────────────────────────────────
// Only checks whether the user is authenticated (token exists).
// Does NOT perform role-based redirects — that is LoginPage's responsibility.
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return user ? children : <Navigate to="/login" replace />
}

// ─── PublicRoute ──────────────────────────────────────────────────────────────
// Used ONLY on /login, /register, /register-club.
// Logged-in users are redirected away so they don't land on auth pages.
//   - sks_staff  → /sks-panel
//   - everyone else → /
// All other routes (protected pages) pass through PrivateRoute directly and
// are never wrapped in PublicRoute, so this does NOT cause redirect loops.
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (user) {
    return <Navigate to={user.role === 'sks_staff' ? '/sks-panel' : '/'} replace />
  }

  return children
}

// ─── Placeholder pages (to be replaced with real components later) ─────────────
function PlaceholderPage({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <p style={{ fontWeight: 600, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{title}</p>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Auth routes (public only) ── */}
          <Route path="/login"         element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register"      element={<PublicRoute><StudentRegisterPage /></PublicRoute>} />
          <Route path="/register-club" element={<PublicRoute><ClubRegisterPage /></PublicRoute>} />

          {/* ── Protected app routes ── */}
          <Route path="/"         element={<PrivateRoute><PlaceholderPage title="Ana Sayfa" /></PrivateRoute>} />
          <Route path="/clubs"    element={<PrivateRoute><PlaceholderPage title="Kulüpler" /></PrivateRoute>} />
          <Route path="/events"   element={<PrivateRoute><PlaceholderPage title="Etkinlikler" /></PrivateRoute>} />
          <Route path="/profile"  element={<PrivateRoute><PlaceholderPage title="Profil" /></PrivateRoute>} />
          <Route path="/sks-panel" element={<PrivateRoute><SKSPanel /></PrivateRoute>} />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
