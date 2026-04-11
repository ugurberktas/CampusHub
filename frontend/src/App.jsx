import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import StudentRegisterPage from './pages/StudentRegisterPage'
import ClubRegisterPage from './pages/ClubRegisterPage'
import SKSPanel from './pages/SKSPanel'
import HomePage from './pages/HomePage'
import ClubsPage from './pages/ClubsPage'
import ClubDetailPage from './pages/ClubDetailPage'
import EventDetailPage from './pages/EventDetailPage'

// Require authentication — redirect to /login if not logged in
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

// Redirect already-logged-in users away from auth pages
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/" replace /> : children
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
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/clubs" element={<PrivateRoute><ClubsPage /></PrivateRoute>} />
          <Route path="/clubs/:id" element={<PrivateRoute><ClubDetailPage /></PrivateRoute>} />
          <Route path="/events/:id" element={<PrivateRoute><EventDetailPage /></PrivateRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
