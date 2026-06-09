import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  TextInput, Alert, RefreshControl, Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ClubDashboard({ navigate }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('events');
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [registrantsModal, setRegistrantsModal] = useState(null);
  const [registrants, setRegistrants] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', location: '',
    capacity: '', start_time: '', end_time: '', salon_id: ''
  });
  const [salons, setSalons] = useState([]);

  const fetchData = async () => {
    try {
      const myClubsRes = await api.get('/auth/me/clubs');
      if (!myClubsRes.data.length) {
        setLoading(false);
        return;
      }
      const clubId = myClubsRes.data[0].club_id;
      const [clubRes, eventsRes, membersRes, salonsRes, annRes] =
        await Promise.all([
          api.get('/clubs').then(r => r.data.find(c => c.id === clubId)),
          api.get('/events').then(r => r.data.filter(e => e.club_id === clubId)),
          api.get(`/clubs/${clubId}/members`),
          api.get('/salons'),
          api.get('/announcements?target=club'),
        ]);
      setClub(clubRes);
      setEvents(eventsRes);
      setMembers(membersRes.data);
      setSalons(salonsRes.data);
      setAnnouncements(annRes.data.slice(0, 2));
    } catch (err) {
      console.log('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateEvent = async () => {
    if (!form.title || !form.location || !form.start_time) {
      Alert.alert('Hata', 'Başlık, konum ve tarih zorunludur.');
      return;
    }
    try {
      await api.post('/events', {
        title: form.title,
        description: form.description,
        location: form.location,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        event_date: form.start_time,
        club_id: club.id,
      });
      if (form.salon_id && form.start_time) {
        try {
          await api.post('/salon_reservations', {
            salon_id: form.salon_id,
            club_id: club.id,
            reservation_date: form.start_time.split('T')[0],
            time_slot: form.end_time
              ? `${form.start_time.split('T')[1]} - ${form.end_time.split('T')[1]}`
              : form.start_time.split('T')[1],
          });
        } catch (salonErr) {
          if (salonErr.response?.status === 409) {
            Alert.alert('Uyarı', salonErr.response.data.detail);
          }
        }
      }
      Alert.alert('Başarılı', 'Etkinlik oluşturuldu!');
      setShowCreateForm(false);
      setForm({ title:'', description:'', location:'',
        capacity:'', start_time:'', end_time:'', salon_id:'' });
      fetchData();
    } catch (err) {
      Alert.alert('Hata', 'Etkinlik oluşturulamadı.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    Alert.alert('Sil', 'Bu etkinliği silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/events/${eventId}`);
          setEvents(prev => prev.filter(e => e.id !== eventId));
        } catch {
          Alert.alert('Hata', 'Etkinlik silinemedi.');
        }
      }},
    ]);
  };

  const handleShowRegistrants = async (eventId) => {
    try {
      const res = await api.get(`/events/${eventId}/registrations`);
      setRegistrants(res.data);
      setRegistrantsModal(eventId);
    } catch {
      Alert.alert('Hata', 'Kayıt listesi alınamadı.');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
      </View>
    );
  }

  // EVENTS TAB
  const EventsTab = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          tintColor="#800000" />
      }>

      {announcements.map(ann => (
        <View key={ann.id} style={styles.announcementCard}>
          <Text style={styles.announcementBadge}>📢 SKS Duyurusu</Text>
          <Text style={styles.announcementTitle}>{ann.title}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => setShowCreateForm(!showCreateForm)}>
        <Text style={styles.createBtnText}>
          {showCreateForm ? '✕ İptal' : '+ Yeni Etkinlik Oluştur'}
        </Text>
      </TouchableOpacity>

      {showCreateForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Yeni Etkinlik</Text>

          <Text style={styles.label}>Başlık *</Text>
          <TextInput
            value={form.title}
            onChangeText={v => setForm({...form, title: v})}
            placeholder="Etkinlik başlığı"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            value={form.description}
            onChangeText={v => setForm({...form, description: v})}
            placeholder="Etkinlik açıklaması"
            style={[styles.input, {height: 80}]}
            multiline
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Konum *</Text>
          <TextInput
            value={form.location}
            onChangeText={v => setForm({...form, location: v})}
            placeholder="Etkinlik konumu"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Kontenjan</Text>
          <TextInput
            value={form.capacity}
            onChangeText={v => setForm({...form, capacity: v})}
            placeholder="Maksimum katılımcı sayısı"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Başlangıç Tarihi/Saati *</Text>
          <TextInput
            value={form.start_time}
            onChangeText={v => setForm({...form, start_time: v})}
            placeholder="2026-06-20T14:00"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Bitiş Tarihi/Saati</Text>
          <TextInput
            value={form.end_time}
            onChangeText={v => setForm({...form, end_time: v})}
            placeholder="2026-06-20T16:00"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Salon Seç</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{marginBottom: 16}}>
            {salons.map(salon => (
              <TouchableOpacity
                key={salon.id}
                style={[styles.salonChip,
                  form.salon_id === salon.id && styles.salonChipActive]}
                onPress={() => setForm({...form, salon_id: salon.id})}>
                <Text style={[styles.salonChipText,
                  form.salon_id === salon.id && styles.salonChipTextActive]}>
                  {salon.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleCreateEvent}>
            <Text style={styles.submitBtnText}>Etkinlik Oluştur</Text>
          </TouchableOpacity>
        </View>
      )}

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>Henüz etkinlik yok</Text>
        </View>
      ) : (
        events.map(event => (
          <View key={event.id} style={styles.eventCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>{formatDate(event.event_date)}</Text>
            <Text style={styles.eventLocation}>📍 {event.location}</Text>
            <Text style={styles.eventCount}>
              👥 {event.registered_count || 0}
              {event.capacity ? ` / ${event.capacity}` : ''} kayıtlı
            </Text>
            <View style={styles.eventActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleShowRegistrants(event.id)}>
                <Text style={styles.actionBtnText}>Kayıt Olanlar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={() => handleDeleteEvent(event.id)}>
                <Text style={styles.actionBtnDangerText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      <View style={{height: 100}} />
    </ScrollView>
  );

  // MEMBERS TAB
  const MembersTab = () => (
    <ScrollView style={styles.scrollView}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>
        Üyeler ({members.length})
      </Text>
      {members.map((member, index) => (
        <View key={index} style={styles.memberCard}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>
              {member.full_name?.charAt(0) || '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.memberName}>{member.full_name}</Text>
            <Text style={styles.memberRole}>
              {member.role === 'owner' ? 'Kulüp Başkanı' : 'Üye'}
            </Text>
          </View>
        </View>
      ))}
      <View style={{height: 100}} />
    </ScrollView>
  );

  // PROFILE TAB
  const ProfileTab = () => (
    <ScrollView style={styles.scrollView}
      showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {club?.name?.charAt(0) || 'K'}
          </Text>
        </View>
        <Text style={styles.profileName}>{club?.name}</Text>
        <Text style={styles.profileCategory}>{club?.category}</Text>
        <Text style={styles.profileDesc}>{club?.description}</Text>
      </View>

      <View style={styles.profileStats}>
        <View style={styles.profileStat}>
          <Text style={styles.profileStatNum}>{members.length}</Text>
          <Text style={styles.profileStatLabel}>Üye</Text>
        </View>
        <View style={styles.profileStatDivider} />
        <View style={styles.profileStat}>
          <Text style={styles.profileStatNum}>{events.length}</Text>
          <Text style={styles.profileStatLabel}>Etkinlik</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Danışman</Text>
        <Text style={styles.infoValue}>{club?.advisor_name || '-'}</Text>
        <Text style={styles.infoLabel}>E-posta</Text>
        <Text style={styles.infoValue}>{club?.advisor_email || '-'}</Text>
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => { await logout(); navigate('Login'); }}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
      <View style={{height: 100}} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>
          {club?.name || 'Campus Hub'}
        </Text>
        <View style={styles.navAvatar}>
          <Text style={styles.navAvatarText}>
            {club?.name?.charAt(0) || 'K'}
          </Text>
        </View>
      </View>

      {/* Content */}
      {activeTab === 'events' && <EventsTab />}
      {activeTab === 'members' && <MembersTab />}
      {activeTab === 'profile' && <ProfileTab />}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('events')}>
          <Text style={styles.tabIcon}>📅</Text>
          <Text style={[styles.tabLabel,
            activeTab === 'events' && styles.tabLabelActive]}>
            Etkinlikler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('members')}>
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={[styles.tabLabel,
            activeTab === 'members' && styles.tabLabelActive]}>
            Üyeler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('profile')}>
          <Text style={styles.tabIcon}>🏛️</Text>
          <Text style={[styles.tabLabel,
            activeTab === 'profile' && styles.tabLabelActive]}>
            Kulüp
          </Text>
        </TouchableOpacity>
      </View>

      {/* Registrants Modal */}
      <Modal
        visible={!!registrantsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setRegistrantsModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kayıt Olanlar</Text>
            <ScrollView>
              {registrants.length === 0 ? (
                <Text style={styles.emptyText}>Henüz kayıt yok</Text>
              ) : (
                registrants.map((r, i) => (
                  <View key={i} style={styles.memberCard}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {r.full_name?.charAt(0) || '?'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.memberName}>{r.full_name}</Text>
                      <Text style={styles.memberRole}>{r.department}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setRegistrantsModal(null)}>
              <Text style={styles.modalCloseBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  navbar: { height: 56, backgroundColor: '#800000',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16 },
  navTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, flex: 1 },
  navAvatar: { width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center' },
  navAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold',
    color: '#1f2937', marginTop: 16, marginBottom: 10 },
  announcementCard: { backgroundColor: '#fff5f5', borderRadius: 12,
    padding: 14, marginTop: 12, borderLeftWidth: 3,
    borderLeftColor: '#800000' },
  announcementBadge: { color: '#800000', fontSize: 11,
    fontWeight: '600', marginBottom: 4 },
  announcementTitle: { color: '#1f2937', fontWeight: 'bold', fontSize: 14 },
  createBtn: { backgroundColor: '#800000', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  formCard: { backgroundColor: '#fff', borderRadius: 16,
    padding: 20, marginTop: 12,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  formTitle: { color: '#1f2937', fontWeight: 'bold',
    fontSize: 18, marginBottom: 16 },
  label: { color: '#6b7280', fontSize: 12, fontWeight: '600',
    marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14,
    color: '#111827', marginBottom: 14, backgroundColor: '#fafafa' },
  salonChip: { borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8 },
  salonChipActive: { backgroundColor: '#800000', borderColor: '#800000' },
  salonChipText: { color: '#6b7280', fontSize: 12 },
  salonChipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: '#800000', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: '#9ca3af', fontSize: 14 },
  eventCard: { backgroundColor: '#fff', borderRadius: 14,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  eventTitle: { color: '#111827', fontWeight: 'bold',
    fontSize: 15, marginBottom: 6 },
  eventDate: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  eventLocation: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  eventCount: { color: '#6b7280', fontSize: 12, marginBottom: 12 },
  eventActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center' },
  actionBtnText: { color: '#374151', fontWeight: '600', fontSize: 12 },
  actionBtnDanger: { backgroundColor: '#fff5f5' },
  actionBtnDangerText: { color: '#dc2626', fontWeight: '600', fontSize: 12 },
  memberCard: { flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 10, shadowColor: '#000',
    shadowOffset: {width:0, height:2}, shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 2 },
  memberAvatar: { width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#800000', justifyContent: 'center',
    alignItems: 'center', marginRight: 12 },
  memberAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  memberName: { color: '#1f2937', fontWeight: '600', fontSize: 14 },
  memberRole: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  profileCard: { backgroundColor: '#fff', borderRadius: 20,
    padding: 24, alignItems: 'center', marginTop: 16,
    shadowColor: '#000', shadowOffset: {width:0, height:3},
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  profileAvatar: { width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#800000', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12 },
  profileAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 28 },
  profileName: { color: '#1f2937', fontWeight: 'bold', fontSize: 20 },
  profileCategory: { color: '#6b7280', fontSize: 13, marginTop: 4 },
  profileDesc: { color: '#9ca3af', fontSize: 12, marginTop: 8,
    textAlign: 'center', lineHeight: 18 },
  profileStats: { backgroundColor: '#fff', borderRadius: 16,
    flexDirection: 'row', marginTop: 12, padding: 16,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatNum: { color: '#800000', fontWeight: 'bold', fontSize: 24 },
  profileStatLabel: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  profileStatDivider: { width: 1, backgroundColor: '#e5e7eb' },
  infoCard: { backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginTop: 12,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  infoLabel: { color: '#9ca3af', fontSize: 11, fontWeight: '600',
    marginTop: 8 },
  infoValue: { color: '#374151', fontSize: 14, marginTop: 2 },
  logoutBtn: { backgroundColor: '#800000', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
    paddingBottom: 20, paddingTop: 10,
    shadowColor: '#000', shadowOffset: {width:0, height:-3},
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 10 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22 },
  tabLabel: { color: '#9ca3af', fontSize: 10, marginTop: 2 },
  tabLabelActive: { color: '#800000', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
  modalTitle: { color: '#1f2937', fontWeight: 'bold',
    fontSize: 18, marginBottom: 16 },
  modalCloseBtn: { backgroundColor: '#800000', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  modalCloseBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
