import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, 
  TouchableOpacity, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import StudentDashboard from './src/screens/StudentDashboard';
import ClubDashboard from './src/screens/ClubDashboard';
import SksPanel from './src/screens/SksPanel';

function PlaceholderScreen({ title, navigate }) {
  const { logout } = useAuth();
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await logout();
          navigate('Login');
        }}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

function AppContent() {
  const { loading, user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState(null);

  const navigate = (screen) => setCurrentScreen(screen);

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'student') setCurrentScreen('StudentDashboard');
        else if (user.role === 'club_owner') setCurrentScreen('ClubDashboard');
        else if (user.role === 'sks_staff') setCurrentScreen('SksPanel');
        else setCurrentScreen('Login');
      } else {
        setCurrentScreen('Login');
      }
    }
  }, [loading, user]);

  if (loading || !currentScreen) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (currentScreen === 'Login') return <LoginScreen navigate={navigate} />;
  if (currentScreen === 'StudentDashboard') return <StudentDashboard navigate={navigate} />;
  if (currentScreen === 'ClubDashboard') return <ClubDashboard navigate={navigate} />;
  if (currentScreen === 'SksPanel') return <SksPanel navigate={navigate} />;

  return <LoginScreen navigate={navigate} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', 
    alignItems: 'center', backgroundColor: '#800000' },
  placeholder: { flex: 1, justifyContent: 'center', 
    alignItems: 'center', backgroundColor: '#f8f9fa' },
  placeholderTitle: { fontSize: 24, fontWeight: 'bold', 
    color: '#800000', marginBottom: 32 },
  logoutBtn: { backgroundColor: '#800000', borderRadius: 12,
    paddingHorizontal: 32, paddingVertical: 14 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
