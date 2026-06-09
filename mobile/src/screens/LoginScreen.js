import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert,
  StyleSheet, Animated, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigate }) {
  const { login } = useAuth();
  const [screen, setScreen] = useState('splash'); 
  // splash → landing → login
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Splash animasyonu
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1, tension: 50, friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1, duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(contentOpacity, {
          toValue: 1, duration: 400,
          useNativeDriver: true,
        }).start(() => setScreen('landing'));
      }, 800);
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre zorunludur.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      console.log('Login user role:', user.role);
      if (user.role === 'student') navigate('StudentDashboard');
      else if (user.role === 'club_owner') navigate('ClubDashboard');
      else if (user.role === 'sks_staff') navigate('SksPanel');
    } catch (err) {
      Alert.alert('Hata', 'E-posta veya şifre yanlış.');
    } finally {
      setLoading(false);
    }
  };

  // SPLASH ekranı
  if (screen === 'splash') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.splashInner}>
          <Animated.View style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
            alignItems: 'center',
          }}>
            <Text style={styles.logo}>Campus Hub</Text>
            <Text style={styles.subtitle}>Fırat Üniversitesi</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // LANDING ekranı
  if (screen === 'landing') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.splashInner}>

          <Text style={styles.logo}>Campus Hub</Text>
          <Text style={styles.subtitle}>Fırat Üniversitesi</Text>

          <Text style={styles.tagline}>
            Kampüs hayatını keşfet,{'\n'}topluluğuna katıl.
          </Text>

          {/* Öğrenci Kartı */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => { 
              setEmail(''); 
              setPassword(''); 
              setRole('student'); 
              setScreen('login'); 
            }}>
            <Text style={styles.roleIcon}>🎓</Text>
            <View>
              <Text style={styles.roleTitle}>Öğrenci</Text>
              <Text style={styles.roleDesc}>Etkinliklere katıl, yoklama ver</Text>
            </View>
            <Text style={styles.roleArrow}>›</Text>
          </TouchableOpacity>

          {/* Topluluk Kartı */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => { 
              setEmail(''); 
              setPassword(''); 
              setRole('club_owner'); 
              setScreen('login'); 
            }}>
            <Text style={styles.roleIcon}>🏛️</Text>
            <View>
              <Text style={styles.roleTitle}>Topluluk</Text>
              <Text style={styles.roleDesc}>Üyelerini yönet, etkinlik oluştur</Text>
            </View>
            <Text style={styles.roleArrow}>›</Text>
          </TouchableOpacity>

          {/* Gizli SKS linki */}
          <TouchableOpacity
            style={styles.sksLink}
            onPress={() => { 
              setEmail(''); 
              setPassword(''); 
              setRole('sks_staff'); 
              setScreen('login'); 
            }}>
            <Text style={styles.sksLinkText}>© 2026 Campus Hub</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  }

  // LOGIN ekranı
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.splashInner}>

        <TouchableOpacity
          onPress={() => setScreen('landing')}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Geri</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {role === 'student' ? '🎓 Öğrenci Girişi'
              : role === 'club_owner' ? '🏛️ Topluluk Girişi'
              : '🔐 SKS Girişi'}
          </Text>

          <Text style={styles.label}>E-posta</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@firat.edu.tr"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={styles.button}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Giriş Yap</Text>}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#800000' },
  splashInner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logo: { color: '#fff', fontSize: 38, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 },
  subtitle: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: 12, marginTop: 6, letterSpacing: 2, marginBottom: 32 },
  tagline: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', lineHeight: 30, marginBottom: 32 },
  roleCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  roleIcon: { fontSize: 28, marginRight: 14 },
  roleTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  roleDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  roleArrow: { color: '#fff', fontSize: 24, marginLeft: 'auto' },
  sksLink: { marginTop: 24, alignItems: 'center', paddingVertical: 8 },
  sksLinkText: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  backBtn: { marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  cardTitle: { color: '#1f2937', fontWeight: 'bold', fontSize: 20, marginBottom: 24 },
  label: { color: '#6b7280', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111827', marginBottom: 16, backgroundColor: '#fafafa' },
  button: { backgroundColor: '#800000', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#800000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
