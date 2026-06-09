import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  TextInput, Alert, RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function SksPanel({ navigate }) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [pendingClubs, setPendingClubs] = useState([]);
  const [activeClubs, setActiveClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annTarget, setAnnTarget] = useState('all');

  const fetchData = async () => {
    try {
      const [statsRes, clubsRes, eventsRes, 
        studentsRes, reservationsRes, annRes] =
        await Promise.all([
          api.get('/sks/stats'),
          api.get('/clubs'),
          api.get('/events'),
          api.get('/auth/users'),
          api.get('/salon_reservations'),
          api.get('/announcements'),
        ]);
      setStats(statsRes.data);
      const allClubs = clubsRes.data;
      setPendingClubs(allClubs.filter(c => c.status === 'pending'));
      setActiveClubs(allClubs.filter(c => c.status === 'active'));
      setEvents(eventsRes.data);
      setStudents(studentsRes.data.filter(u => u.role === 'student'));
      setReservations(reservationsRes.data);
      setAnnouncements(annRes.data);
    } catch (err) {
      console.log('SKS fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (clubId) => {
    try {
      await api.put(`/clubs/${clubId}/approve`);
      setPendingClubs(prev => prev.filter(c => c.id !== clubId));
      Alert.alert('Başarılı', 'Kulüp onaylandı!');
      fetchData();
    } catch {
      Alert.alert('Hata', 'İşlem başarısız.');
    }
  };

  const handleReject = async (clubId) => {
    Alert.alert('Reddet', 'Bu kulübü reddetmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Reddet', style: 'destructive', onPress: async () => {
        try {
          await api.put(`/clubs/${clubId}/reject`);
          setPendingClubs(prev => prev.filter(c => c.id !== clubId));
          fetchData();
        } catch {
          Alert.alert('Hata', 'İşlem başarısız.');
        }
      }},
    ]);
  };

  const handleSuspend = async (clubId) => {
    Alert.alert('Askıya Al', 'Bu kulübü askıya almak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Askıya Al', style: 'destructive', onPress: async () => {
        try {
          await api.put(`/clubs/${clubId}/suspend`);
          fetchData();
        } catch {
          Alert.alert('Hata', 'İşlem başarısız.');
        }
      }},
    ]);
  };

  const handleCreateAnnouncement = async () => {
    if (!annTitle || !annContent) {
      Alert.alert('Hata', 'Başlık ve içerik zorunludur.');
      return;
    }
    try {
      await api.post('/announcements', {
        title: annTitle,
        content: annContent,
        target_audience: annTarget,
      });
      Alert.alert('Başarılı', 'Duyuru yayınlandı!');
      setAnnTitle('');
      setAnnContent('');
      fetchData();
    } catch {
      Alert.alert('Hata', 'Duyuru oluşturulamadı.');
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    Alert.alert('Sil', 'Bu duyuruyu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/announcements/${annId}`);
          setAnnouncements(prev => prev.filter(a => a.id !== annId));
        } catch {
          Alert.alert('Hata', 'Duyuru silinemedi.');
        }
      }},
    ]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
      </View>
    );
  }

  // OVERVIEW TAB
  const OverviewTab = () => (
    <ScrollView style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          tintColor="#800000" />
      }>
      <Text style={styles.sectionTitle}>Genel Bakış</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{stats?.total_students || 0}</Text>
          <Text style={styles.statLabel}>Öğrenci</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{stats?.total_clubs || 0}</Text>
          <Text style={styles.statLabel}>Topluluk</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{stats?.total_events || 0}</Text>
          <Text style={styles.statLabel}>Etkinlik</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{pendingClubs.length}</Text>
          <Text style={styles.statLabel}>Bekleyen</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📊 Sistem Durumu</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoRowLabel}>Platform</Text>
          <Text style={styles.infoRowValue}>Campus Hub v1.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoRowLabel}>Üniversite</Text>
          <Text style={styles.infoRowValue}>Fırat Üniversitesi</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoRowLabel}>Aktif Topluluk</Text>
          <Text style={styles.infoRowValue}>{activeClubs.length}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoRowLabel}>Bekleyen Başvuru</Text>
          <Text style={styles.infoRowValue}>{pendingClubs.length}</Text>
        </View>
      </View>

      <View style={{height: 100}} />
    </ScrollView>
  );

  // PENDING TAB
  const PendingTab = () => (
    <ScrollView style={styles.scrollView}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>
        Onay Bekleyenler ({pendingClubs.length})
      </Text>
      {pendingClubs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyText}>Bekleyen başvuru yok</Text>
        </View>
      ) : (
        pendingClubs.map(club => (
          <View key={club.id} style={styles.clubCard}>
            <View style={styles.clubAvatar}>
              <Text style={styles.clubAvatarText}>
                {club.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>{club.name}</Text>
              <Text style={styles.clubCategory}>{club.category}</Text>
              {club.advisor_name && (
                <Text style={styles.clubAdvisor}>
                  👨🏫 {club.advisor_name}
                </Text>
              )}
            </View>
            <View style={styles.clubActions}>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApprove(club.id)}>
                <Text style={styles.approveBtnText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleReject(club.id)}>
                <Text style={styles.rejectBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      <View style={{height: 100}} />
    </ScrollView>
  );

  // CLUBS TAB
  const ClubsTab = () => (
    <ScrollView style={styles.scrollView}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>
        Aktif Topluluklar ({activeClubs.length})
      </Text>
      {activeClubs.map(club => (
        <View key={club.id} style={styles.clubCard}>
          <View style={styles.clubAvatar}>
            <Text style={styles.clubAvatarText}>
              {club.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.clubInfo}>
            <Text style={styles.clubName}>{club.name}</Text>
            <Text style={styles.clubCategory}>{club.category}</Text>
          </View>
          <TouchableOpacity
            style={styles.suspendBtn}
            onPress={() => handleSuspend(club.id)}>
            <Text style={styles.suspendBtnText}>Askıya Al</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={{height: 100}} />
    </ScrollView>
  );

  // STUDENTS TAB
  const StudentsTab = () => (
    <ScrollView style={styles.scrollView}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>
        Öğrenci Veritabanı ({students.length})
      </Text>
      {students.map((student, i) => (
        <View key={i} style={styles.studentCard}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentAvatarText}>
              {student.full_name?.charAt(0) || '?'}
            </Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{student.full_name}</Text>
            <Text style={styles.studentDept}>{student.department || '-'}</Text>
            <Text style={styles.studentGrade}>
              {student.grade ? `${student.grade}. Sınıf` : '-'}
            </Text>
          </View>
          <Text style={styles.studentNo}>
            {student.student_no || '-'}
          </Text>
        </View>
      ))}
      <View style={{height: 100}} />
    </ScrollView>
  );

  // RESERVATIONS TAB
  const ReservationsTab = () => (
    <ScrollView style={styles.scrollView}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>
        Salon Rezervasyonları ({reservations.length})
      </Text>
      {reservations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏛️</Text>
          <Text style={styles.emptyText}>Rezervasyon yok</Text>
        </View>
      ) : (
        reservations.map(r => (
          <View key={r.id} style={styles.reservationCard}>
            <Text style={styles.reservationSalon}>{r.salon_name}</Text>
            <Text style={styles.reservationClub}>🏛️ {r.club_name}</Text>
            <Text style={styles.reservationDate}>
              📅 {r.reservation_date}
            </Text>
            <Text style={styles.reservationTime}>⏰ {r.time_slot}</Text>
          </View>
        ))
      )}
      <View style={{height: 100}} />
    </ScrollView>
  );

  // ANNOUNCEMENTS TAB
  const AnnouncementsTab = () => (
    <ScrollView style={styles.scrollView}
      showsVerticalScrollIndicator={false}>

      {/* Yeni Duyuru Formu */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Yeni Duyuru</Text>

        <Text style={styles.label}>Başlık</Text>
        <TextInput
          value={annTitle}
          onChangeText={setAnnTitle}
          placeholder="Duyuru başlığı"
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>İçerik</Text>
        <TextInput
          value={annContent}
          onChangeText={setAnnContent}
          placeholder="Duyuru içeriği"
          style={[styles.input, {height: 80}]}
          multiline
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Hedef Kitle</Text>
        <View style={styles.targetRow}>
          {['all', 'student', 'club'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.targetChip,
                annTarget === t && styles.targetChipActive]}
              onPress={() => setAnnTarget(t)}>
              <Text style={[styles.targetChipText,
                annTarget === t && styles.targetChipTextActive]}>
                {t === 'all' ? 'Herkese'
                  : t === 'student' ? 'Öğrenciler'
                  : 'Kulüpler'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleCreateAnnouncement}>
          <Text style={styles.submitBtnText}>Duyuru Yayınla</Text>
        </TouchableOpacity>
      </View>

      {/* Mevcut Duyurular */}
      <Text style={styles.sectionTitle}>
        Duyurular ({announcements.length})
      </Text>
      {announcements.map(ann => (
        <View key={ann.id} style={styles.announcementCard}>
          <View style={styles.announcementHeader}>
            <Text style={styles.announcementTitle}>{ann.title}</Text>
            <TouchableOpacity
              onPress={() => handleDeleteAnnouncement(ann.id)}>
              <Text style={styles.deleteText}>Sil</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.announcementContent}
            numberOfLines={2}>
            {ann.content}
          </Text>
          <Text style={styles.announcementTarget}>
            📣 {ann.target_audience === 'all' ? 'Herkese'
              : ann.target_audience === 'student' ? 'Öğrenciler'
              : 'Kulüpler'}
          </Text>
        </View>
      ))}
      <View style={{height: 100}} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <View>
          <Text style={styles.navTitle}>SKS Paneli</Text>
          <Text style={styles.navSubtitle}>Campus Hub</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => { await logout(); navigate('Login'); }}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'pending' && <PendingTab />}
      {activeTab === 'clubs' && <ClubsTab />}
      {activeTab === 'students' && <StudentsTab />}
      {activeTab === 'reservations' && <ReservationsTab />}
      {activeTab === 'announcements' && <AnnouncementsTab />}

      {/* Bottom Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}>
        {[
          { key: 'overview', icon: '📊', label: 'Genel' },
          { key: 'pending', icon: '⏳', label: 'Bekleyen' },
          { key: 'clubs', icon: '🏛️', label: 'Topluluklar' },
          { key: 'students', icon: '🎓', label: 'Öğrenciler' },
          { key: 'reservations', icon: '📅', label: 'Salonlar' },
          { key: 'announcements', icon: '📢', label: 'Duyurular' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}>
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  navbar: { height: 64, backgroundColor: '#800000',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16 },
  navTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  navSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold',
    color: '#1f2937', marginTop: 16, marginBottom: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff',
    borderRadius: 16, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  statNum: { color: '#800000', fontWeight: 'bold', fontSize: 32 },
  statLabel: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  clubCard: { backgroundColor: '#fff', borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', padding: 14,
    marginBottom: 10, shadowColor: '#000',
    shadowOffset: {width:0, height:2}, shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 2 },
  clubAvatar: { width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#800000', justifyContent: 'center',
    alignItems: 'center', marginRight: 12 },
  clubAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  clubInfo: { flex: 1 },
  clubName: { color: '#1f2937', fontWeight: '600', fontSize: 14 },
  clubCategory: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  clubAdvisor: { color: '#6b7280', fontSize: 11, marginTop: 2 },
  clubActions: { flexDirection: 'row', gap: 8 },
  approveBtn: { width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#dcfce7', justifyContent: 'center',
    alignItems: 'center' },
  approveBtnText: { color: '#16a34a', fontWeight: 'bold', fontSize: 16 },
  rejectBtn: { width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fee2e2', justifyContent: 'center',
    alignItems: 'center' },
  rejectBtnText: { color: '#dc2626', fontWeight: 'bold', fontSize: 16 },
  suspendBtn: { backgroundColor: '#fef3c7', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6 },
  suspendBtnText: { color: '#d97706', fontWeight: '600', fontSize: 11 },
  studentCard: { backgroundColor: '#fff', borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', padding: 14,
    marginBottom: 10, shadowColor: '#000',
    shadowOffset: {width:0, height:2}, shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 2 },
  studentAvatar: { width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#800000', justifyContent: 'center',
    alignItems: 'center', marginRight: 12 },
  studentAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  studentInfo: { flex: 1 },
  studentName: { color: '#1f2937', fontWeight: '600', fontSize: 14 },
  studentDept: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  studentGrade: { color: '#9ca3af', fontSize: 11, marginTop: 1 },
  studentNo: { color: '#9ca3af', fontSize: 11 },
  reservationCard: { backgroundColor: '#fff', borderRadius: 14,
    padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  reservationSalon: { color: '#1f2937', fontWeight: 'bold',
    fontSize: 14, marginBottom: 6 },
  reservationClub: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  reservationDate: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  reservationTime: { color: '#6b7280', fontSize: 12 },
  formCard: { backgroundColor: '#fff', borderRadius: 16,
    padding: 20, marginTop: 16,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  formTitle: { color: '#1f2937', fontWeight: 'bold',
    fontSize: 18, marginBottom: 16 },
  label: { color: '#6b7280', fontSize: 12, fontWeight: '600',
    marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14,
    color: '#111827', marginBottom: 14, backgroundColor: '#fafafa' },
  targetRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  targetChip: { flex: 1, borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 20, paddingVertical: 8, alignItems: 'center' },
  targetChipActive: { backgroundColor: '#800000',
    borderColor: '#800000' },
  targetChipText: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
  targetChipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: '#800000', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  announcementCard: { backgroundColor: '#fff', borderRadius: 14,
    padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  announcementHeader: { flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6 },
  announcementTitle: { color: '#1f2937', fontWeight: 'bold',
    fontSize: 14, flex: 1 },
  deleteText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  announcementContent: { color: '#6b7280', fontSize: 12,
    lineHeight: 18, marginBottom: 6 },
  announcementTarget: { color: '#9ca3af', fontSize: 11 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: '#9ca3af', fontSize: 14 },
  tabBar: { backgroundColor: '#fff', borderTopWidth: 1,
    borderTopColor: '#f3f4f6', maxHeight: 65,
    shadowColor: '#000', shadowOffset: {width:0, height:-3},
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 10 },
  tabBarContent: { paddingHorizontal: 8, paddingBottom: 10,
    paddingTop: 8 },
  tabItem: { alignItems: 'center', paddingHorizontal: 14 },
  tabIcon: { fontSize: 20 },
  tabLabel: { color: '#9ca3af', fontSize: 10, marginTop: 2 },
  tabLabelActive: { color: '#800000', fontWeight: '600' },
  infoCard: { backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginTop: 12,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  infoCardTitle: { color: '#1f2937', fontWeight: 'bold',
    fontSize: 15, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6' },
  infoRowLabel: { color: '#6b7280', fontSize: 13 },
  infoRowValue: { color: '#1f2937', fontWeight: '600', fontSize: 13 },
});
