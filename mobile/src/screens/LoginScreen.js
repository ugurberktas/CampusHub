import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert,
  StyleSheet, Animated, KeyboardAvoidingView, Platform, ScrollView
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
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regStudentNo, setRegStudentNo] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regGrade, setRegGrade] = useState('1');
  const [clubStep, setClubStep] = useState(1);
  const [regClubOwnerName, setRegClubOwnerName] = useState('');
  const [regClubOwnerEmail, setRegClubOwnerEmail] = useState('');
  const [regClubOwnerPassword, setRegClubOwnerPassword] = useState('');
  const [regClubName, setRegClubName] = useState('');
  const [regClubDesc, setRegClubDesc] = useState('');
  const [regClubCategory, setRegClubCategory] = useState('Bilim');
  const [regAdvisorName, setRegAdvisorName] = useState('');
  const [regAdvisorFaculty, setRegAdvisorFaculty] = useState('');
  const [regAdvisorEmail, setRegAdvisorEmail] = useState('');
  const [regClubLoading, setRegClubLoading] = useState(false);

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

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword || !regDepartment) {
      Alert.alert('Hata', 'Ad, e-posta, şifre ve bölüm zorunludur.');
      return;
    }
    if (!regEmail.endsWith('.edu.tr')) {
      Alert.alert('Hata', 'Geçerli bir üniversite e-postası girin.');
      return;
    }
    setRegLoading(true);
    try {
      const api = require('../api/axios').default;
      await api.post('/auth/register', {
        full_name: regName,
        email: regEmail,
        password: regPassword,
        department: regDepartment,
        student_no: regStudentNo,
        grade: regGrade,
        role: 'student',
        university_id: 'ff32ece1-cb04-443f-ac8b-45f924fd8709',
        university: 'ff32ece1-cb04-443f-ac8b-45f924fd8709',
      });
      Alert.alert('Başarılı', 'Kayıt tamamlandı! Giriş yapabilirsiniz.', [
        { text: 'Tamam', onPress: () => {
          setScreen('login');
          setRole('student');
        }}
      ]);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Kayıt başarısız.';
      Alert.alert('Hata', msg);
    } finally {
      setRegLoading(false);
    }
  };

  const handleClubRegister = async () => {
    if (!regClubOwnerName || !regClubOwnerEmail || 
      !regClubOwnerPassword || !regClubName) {
      Alert.alert('Hata', 'Zorunlu alanları doldurun.');
      return;
    }
    if (!regClubOwnerEmail.endsWith('.edu.tr')) {
      Alert.alert('Hata', 'Geçerli bir üniversite e-postası girin.');
      return;
    }
    setRegClubLoading(true);
    try {
      const api = require('../api/axios').default;
      await api.post('/auth/register', {
        full_name: regClubOwnerName,
        email: regClubOwnerEmail,
        password: regClubOwnerPassword,
        role: 'club_owner',
        university_id: 'ff32ece1-cb04-443f-ac8b-45f924fd8709',
        university: 'ff32ece1-cb04-443f-ac8b-45f924fd8709',
        department: 'Kulüp Yöneticisi',
        grade: '0',
        club_name: regClubName,
        club_description: regClubDesc,
        club_category: regClubCategory,
        advisor_name: regAdvisorName,
        advisor_faculty: regAdvisorFaculty,
        advisor_email: regAdvisorEmail,
      });

      const loginRes = await api.post('/auth/login', {
        username: regClubOwnerEmail,
        password: regClubOwnerPassword,
      });
      const token = loginRes.data.access_token;

      await api.post('/clubs', {
        name: regClubName,
        description: regClubDesc,
        category: regClubCategory,
        advisor_name: regAdvisorName,
        advisor_faculty: regAdvisorFaculty,
        advisor_email: regAdvisorEmail,
        university_id: 'ff32ece1-cb04-443f-ac8b-45f924fd8709',
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Başarılı', 
        'Başvurunuz alındı! SKS onayından sonra giriş yapabilirsiniz.', [
        { text: 'Tamam', onPress: () => {
          setScreen('login');
          setRole('club_owner');
          setClubStep(1);
        }}
      ]);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Kayıt başarısız.';
      Alert.alert('Hata', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setRegClubLoading(false);
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
        <View style={{ flex: 1, justifyContent: 'center', 
          paddingHorizontal: 24 }}>

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

  // REGISTER ekranı
  if (screen === 'register') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.splashInner}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1,
              justifyContent: 'center', paddingHorizontal: 24,
              paddingVertical: 20 }}>

            <TouchableOpacity
              onPress={() => setScreen('login')}
              style={styles.backBtn}>
              <Text style={styles.backText}>‹ Giriş Yap</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎓 Öğrenci Kaydı</Text>

              <Text style={styles.label}>Ad Soyad *</Text>
              <TextInput
                value={regName}
                onChangeText={setRegName}
                placeholder="Adınız Soyadınız"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />

              <Text style={styles.label}>E-posta *</Text>
              <TextInput
                value={regEmail}
                onChangeText={setRegEmail}
                placeholder="ornek@firat.edu.tr"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <Text style={styles.label}>Şifre *</Text>
              <TextInput
                value={regPassword}
                onChangeText={setRegPassword}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
              />

              <Text style={styles.label}>Bölüm *</Text>
              <TextInput
                value={regDepartment}
                onChangeText={setRegDepartment}
                placeholder="Bilgisayar Mühendisliği"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />

              <Text style={styles.label}>Sınıf *</Text>
              <View style={styles.gradeRow}>
                {['Hazırlık','1','2','3','4','5','6'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.gradeChip, 
                      regGrade === g && styles.gradeChipActive]}
                    onPress={() => setRegGrade(g)}>
                    <Text style={[styles.gradeChipText,
                      regGrade === g && styles.gradeChipTextActive]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Öğrenci No</Text>
              <TextInput
                value={regStudentNo}
                onChangeText={setRegStudentNo}
                placeholder="210201001"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                style={styles.input}
              />

              <TouchableOpacity
                onPress={handleRegister}
                disabled={regLoading}
                style={styles.button}>
                {regLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Kayıt Ol</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (screen === 'clubRegister') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1,
              justifyContent: 'center', paddingHorizontal: 24,
              paddingVertical: 20 }}>

            <TouchableOpacity
              onPress={() => {
                if (clubStep === 1) setScreen('login');
                else setClubStep(1);
              }}
              style={styles.backBtn}>
              <Text style={styles.backText}>
                {clubStep === 1 ? '‹ Giriş Yap' : '‹ Geri'}
              </Text>
            </TouchableOpacity>

            {/* Step indicator */}
            <View style={styles.stepRow}>
              <View style={[styles.stepCircle, 
                clubStep >= 1 && styles.stepCircleActive]}>
                <Text style={[styles.stepNum,
                  clubStep >= 1 && styles.stepNumActive]}>1</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={[styles.stepCircle,
                clubStep >= 2 && styles.stepCircleActive]}>
                <Text style={[styles.stepNum,
                  clubStep >= 2 && styles.stepNumActive]}>2</Text>
              </View>
            </View>

            <View style={styles.card}>
              {clubStep === 1 ? (
                <>
                  <Text style={styles.cardTitle}>🏛️ Topluluk Başkanı</Text>
                  <Text style={styles.stepSubtitle}>Önce hesabınızı oluşturun</Text>

                  <Text style={styles.label}>Ad Soyad *</Text>
                  <TextInput
                    value={regClubOwnerName}
                    onChangeText={setRegClubOwnerName}
                    placeholder="Adınız Soyadınız"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                  />

                  <Text style={styles.label}>E-posta *</Text>
                  <TextInput
                    value={regClubOwnerEmail}
                    onChangeText={setRegClubOwnerEmail}
                    placeholder="ornek@firat.edu.tr"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />

                  <Text style={styles.label}>Şifre *</Text>
                  <TextInput
                    value={regClubOwnerPassword}
                    onChangeText={setRegClubOwnerPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    style={styles.input}
                  />

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      if (!regClubOwnerName || !regClubOwnerEmail || 
                        !regClubOwnerPassword) {
                        Alert.alert('Hata', 'Tüm alanları doldurun.');
                        return;
                      }
                      setClubStep(2);
                    }}>
                    <Text style={styles.buttonText}>Devam Et →</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.cardTitle}>Kulüp Bilgileri</Text>
                  <Text style={styles.stepSubtitle}>Kulübünüzü tanıtın</Text>

                  <Text style={styles.label}>Kulüp Adı *</Text>
                  <TextInput
                    value={regClubName}
                    onChangeText={setRegClubName}
                    placeholder="Kulüp adı"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                  />

                  <Text style={styles.label}>Açıklama</Text>
                  <TextInput
                    value={regClubDesc}
                    onChangeText={setRegClubDesc}
                    placeholder="Kulübünüzü kısaca tanıtın"
                    placeholderTextColor="#9ca3af"
                    multiline
                    style={[styles.input, {height: 70}]}
                  />

                  <Text style={styles.label}>Kategori</Text>
                  <View style={styles.gradeRow}>
                    {['Bilim','Kültürel','Spor','Müzik','Sanat','Diğer'].map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.gradeChip,
                          regClubCategory === cat && styles.gradeChipActive]}
                        onPress={() => setRegClubCategory(cat)}>
                        <Text style={[styles.gradeChipText,
                          regClubCategory === cat && styles.gradeChipTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Danışman Adı</Text>
                  <TextInput
                    value={regAdvisorName}
                    onChangeText={setRegAdvisorName}
                    placeholder="Prof. Dr. Adı Soyadı"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                  />

                  <Text style={styles.label}>Danışman E-postası</Text>
                  <TextInput
                    value={regAdvisorEmail}
                    onChangeText={setRegAdvisorEmail}
                    placeholder="danisman@firat.edu.tr"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleClubRegister}
                    disabled={regClubLoading}>
                    {regClubLoading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.buttonText}>Kayıt Ol</Text>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // LOGIN ekranı
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center',
          paddingHorizontal: 24 }}>

          <TouchableOpacity
            onPress={() => setScreen('landing')}
            style={styles.backBtn}>
            <Text style={styles.backText}>‹ Geri</Text>
          </TouchableOpacity>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
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

              {role === 'student' && (
                <TouchableOpacity
                  style={styles.registerLink}
                  onPress={() => setScreen('register')}>
                  <Text style={styles.registerLinkText}>
                    Hesabın yok mu? <Text style={styles.registerLinkBold}>Kayıt Ol</Text>
                  </Text>
                </TouchableOpacity>
              )}

              {role === 'club_owner' && (
                <TouchableOpacity
                  style={styles.registerLink}
                  onPress={() => { setScreen('clubRegister'); setClubStep(1); }}>
                  <Text style={styles.registerLinkText}>
                    Hesabın yok mu? <Text style={styles.registerLinkBold}>Kayıt Ol</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
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
  registerLink: { alignItems: 'center', marginTop: 16 },
  registerLinkText: { color: '#6b7280', fontSize: 13 },
  registerLinkBold: { color: '#800000', fontWeight: 'bold' },
  gradeRow: { flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, marginBottom: 16 },
  gradeChip: { borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  gradeChipActive: { backgroundColor: '#800000',
    borderColor: '#800000' },
  gradeChipText: { color: '#6b7280', fontSize: 13 },
  gradeChipTextActive: { color: '#fff', fontWeight: '600' },
  stepRow: { flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 24 },
  stepCircle: { width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: '#e5e7eb',
    justifyContent: 'center', alignItems: 'center' },
  stepCircleActive: { backgroundColor: '#800000',
    borderColor: '#800000' },
  stepNum: { color: '#9ca3af', fontWeight: 'bold', fontSize: 14 },
  stepNumActive: { color: '#fff' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#e5e7eb',
    marginHorizontal: 8 },
  stepSubtitle: { color: '#6b7280', fontSize: 13, marginBottom: 20 },
});
