import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre zorunludur.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      Alert.alert('Başarılı', 'Hoş geldin ' + (user.full_name || ''));
    } catch (err) {
      Alert.alert('Hata', 'E-posta veya şifre yanlış.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.logo}>Campus Hub</Text>
        <Text style={styles.subtitle}>Fırat Üniversitesi</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Giriş Yap</Text>

          <Text style={styles.label}>E-posta</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@firat.edu.tr"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#800000' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logo: { color: '#fff', fontSize: 34, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: 13, marginBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  cardTitle: { color: '#1f2937', fontWeight: 'bold', fontSize: 20, marginBottom: 24 },
  label: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#374151', marginBottom: 16 },
  button: { backgroundColor: '#800000', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
