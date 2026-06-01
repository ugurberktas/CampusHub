import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import OgrenciGiris from './pages/OgrenciGiris';
import ToplulukGiris from './pages/ToplulukGiris';
import SksGiris from './pages/SksGiris';
import OgrenciKayit from './pages/OgrenciKayit';
import ToplulukKayit from './pages/ToplulukKayit';
import ClubDashboard from './pages/ClubDashboard';
import SksPanel from './pages/SksPanel';
import StudentDashboard from './pages/StudentDashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

const getDashboardRoute = (role) => {
  switch (role) {
    case 'student': return '/student-dashboard';
    case 'club_owner': return '/club-dashboard';
    case 'sks_staff': return '/sks-panel';
    default: return '/';
  }
};

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/" replace />;

  if (user.role !== allowedRole) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/ogrenci-girisi" element={
          <PublicOnlyRoute>
            <OgrenciGiris />
          </PublicOnlyRoute>
        } />
        
        <Route path="/topluluk-girisi" element={
          <PublicOnlyRoute>
            <ToplulukGiris />
          </PublicOnlyRoute>
        } />
        
        <Route path="/sks-giris" element={
          <PublicOnlyRoute>
            <SksGiris />
          </PublicOnlyRoute>
        } />
        
        <Route path="/ogrenci-kayit" element={
          <PublicOnlyRoute>
            <OgrenciKayit />
          </PublicOnlyRoute>
        } />
        
        <Route path="/topluluk-kayit" element={
          <PublicOnlyRoute>
            <ToplulukKayit />
          </PublicOnlyRoute>
        } />
        
        <Route path="/student-dashboard" element={
          <PrivateRoute allowedRole="student">
            <StudentDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute allowedRole="student">
            <ProfilePage />
          </PrivateRoute>
        } />
        
        <Route path="/settings" element={
          <PrivateRoute allowedRole="student">
            <SettingsPage />
          </PrivateRoute>
        } />
        
        <Route path="/club-dashboard" element={
          <PrivateRoute allowedRole="club_owner">
            <ClubDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/sks-panel" element={
          <PrivateRoute allowedRole="sks_staff">
            <SksPanel />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
