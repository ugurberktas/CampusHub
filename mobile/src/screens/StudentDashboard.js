import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  FlatList, RefreshControl, TextInput, Alert, Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ProfileTab = ({ 
  user, registeredEvents, joinedClubs, logout, navigate,
  grade, setGrade, gradeSaved, handleSaveGrade,
  oldPassword, setOldPassword,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  passwordError, passwordSaved, handleChangePassword,
  settingsTab, setSettingsTab,
  setStatsModal
}) => (
  <ScrollView style={styles.scrollView}
    showsVerticalScrollIndicator={false}>

    <View style={styles.profileCard}>
      <View style={styles.profileAvatar}>
        <Text style={styles.profileAvatarText}>
          {user?.full_name?.charAt(0) || 'U'}
        </Text>
      </View>
      <Text style={styles.profileName}>{user?.full_name}</Text>
      <Text style={styles.profileDept}>{user?.department}</Text>
      <Text style={styles.profileGrade}>{user?.grade}. Sınıf</Text>
    </View>

    <View style={styles.profileStats}>
      <TouchableOpacity 
        style={styles.profileStat}
        onPress={() => setStatsModal('events')}>
        <Text style={styles.profileStatNum}>
          {registeredEvents.length}
        </Text>
        <Text style={styles.profileStatLabel}>Etkinlik</Text>
      </TouchableOpacity>
      <View style={styles.profileStatDivider} />
      <TouchableOpacity 
        style={styles.profileStat}
        onPress={() => setStatsModal('clubs')}>
        <Text style={styles.profileStatNum}>
          {joinedClubs.length}
        </Text>
        <Text style={styles.profileStatLabel}>Topluluk</Text>
      </TouchableOpacity>
    </View>

    {/* Settings Tabs */}
    <View style={styles.settingsTabRow}>
      <TouchableOpacity
        style={[styles.settingsTab, settingsTab === 'profile' && styles.settingsTabActive]}
        onPress={() => setSettingsTab('profile')}>
        <Text style={[styles.settingsTabText, settingsTab === 'profile' && styles.settingsTabTextActive]}>
          Profil
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.settingsTab, settingsTab === 'password' && styles.settingsTabActive]}
        onPress={() => setSettingsTab('password')}>
        <Text style={[styles.settingsTabText, settingsTab === 'password' && styles.settingsTabTextActive]}>
          Şifre
        </Text>
      </TouchableOpacity>
    </View>

    {settingsTab === 'profile' && (
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Profil Bilgileri</Text>
        <Text style={styles.settingsSubtitle}>
          Ad, bölüm ve e-posta bilgileri üniversite sisteminden gelir, değiştirilemez.
        </Text>

        <Text style={styles.label}>Ad Soyad</Text>
        <View style={styles.readOnlyInput}>
          <Text style={styles.readOnlyText}>{user?.full_name}</Text>
        </View>

        <Text style={styles.label}>E-posta</Text>
        <View style={styles.readOnlyInput}>
          <Text style={styles.readOnlyText}>{user?.email}</Text>
        </View>

        <Text style={styles.label}>Bölüm</Text>
        <View style={styles.readOnlyInput}>
          <Text style={styles.readOnlyText}>{user?.department || '-'}</Text>
        </View>

        <Text style={styles.label}>Sınıf (Düzenlenebilir)</Text>
        <View style={styles.gradeRow}>
          {['Hazırlık','1','2','3','4','5','6'].map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.gradeChip, grade === g && styles.gradeChipActive]}
              onPress={() => setGrade(g)}>
              <Text style={[styles.gradeChipText, grade === g && styles.gradeChipTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveGrade}>
          <Text style={styles.saveBtnText}>
            {gradeSaved ? '✓ Kaydedildi' : 'Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>
    )}

    {settingsTab === 'password' && (
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Şifre Değiştir</Text>

        <Text style={styles.label}>Mevcut Şifre</Text>
        <TextInput
          value={oldPassword}
          onChangeText={setOldPassword}
          placeholder="••••••••"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Yeni Şifre</Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="••••••••"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword}>
          <Text style={styles.saveBtnText}>
            {passwordSaved ? '✓ Şifre Güncellendi' : 'Şifreyi Güncelle'}
          </Text>
        </TouchableOpacity>
      </View>
    )}

    <TouchableOpacity
      style={styles.logoutBtn}
      onPress={async () => { await logout(); navigate('Login'); }}>
      <Text style={styles.logoutText}>Çıkış Yap</Text>
    </TouchableOpacity>
    <View style={{height: 100}} />
  </ScrollView>
);

export default function StudentDashboard({ navigate }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [grade, setGrade] = useState(user?.grade || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gradeSaved, setGradeSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [statsModal, setStatsModal] = useState(null);

  const getMockRecommendation = () => {
    setAiLoading(true);
    setAiRecommendation('');
    setTimeout(() => {
      const dept = user?.department || '';
      const recommendations = {
        'Bilgisayar Mühendisliği': [
          'Bilgisayar Mühendisliği öğrencisi olarak Google DSC etkinliklerine katılmanı öneririm. Hackathon\'lar kariyerin için çok değerli!',
          'IEEE Fırat\'ın teknik workshopları ve proje yarışmaları yazılım becerilerini geliştirmek için harika fırsatlar sunuyor.',
          'Bilişim ve Yazılım Topluluğu\'nun bootcamp etkinliğine katıl, gerçek projeler üzerinde çalışma deneyimi kazanırsın!',
        ],
        'Yazılım Mühendisliği': [
          'Google DSC\'nin Flutter workshop\'u mobil geliştirme kariyerin için mükemmel bir başlangıç olabilir!',
          'Bilişim ve Yazılım Topluluğu hackathonuna katılarak takım çalışması ve hızlı prototipleme becerisi kazan.',
          'Huawei Geliştirici Topluluğu\'nun etkinlikleri uluslararası sertifikalar için kapı açıyor, kaçırma!',
        ],
        'Elektrik Mühendisliği': [
          'IEEE Fırat etkinlikleri elektrik mühendisliği öğrencileri için birebir. Proje yarışmalarına mutlaka katıl!',
          'TEKNOFEST Topluluğu\'nun roket tasarım workshop\'u mühendislik bilgilerini pratiğe dökmen için harika.',
          'İnsansız Araçlar Topluluğu drone yarışması elektrik-elektronik bilgilerini test etmek için eşsiz bir fırsat!',
        ],
        'Makine Mühendisliği': [
          'TEKNOFEST and İnsansız Araçlar etkinlikleri makine mühendisliği öğrencileri için biçilmiş kaftan!',
          'Makine Mühendisliği Topluluğu\'nun seminerlerine katılarak sektör profesyonelleriyle tanışabilirsin.',
          'İnsansız Araçlar Topluluğu\'nun otonom araç tasarım workshop\'u mekatronik alanında fark yaratır!',
        ],
        'Tıp': [
          'Bilim ve Fen Topluluğu\'nun seminerlerine katılmanı öneririm, tıp öğrencilerine özel içerikler sunuluyor.',
          'Erasmus Topluluğu uluslararası tıp programları için muhteşem bir ağ kurma fırsatı sunuyor.',
          'Suffa Proje Akademi etkinlikleri akademik gelişimin için çok faydalı, mutlaka incele!',
        ],
        'Fizik': [
          'Fizik ve Bilim Topluluğu\'nun araştırma seminerleri akademik kariyerin için çok değerli.',
          'Bilim ve Fen Topluluğu etkinlikleri fizik öğrencileri için özel içerikler sunuyor, kaçırma!',
          'TEKNOFEST yarışmaları fizik bilgini gerçek projelere uygulamak için harika bir platform!',
        ],
      };
      const defaultRecs = [
        'Kampüsteki etkinliklere katılarak yeni insanlarla tanış. Gastronomi Topluluğu\'nun etkinlikleri sosyal hayatın için harika!',
        'Müzik Kulübü\'nün bahar konseri yaklaşıyor, kampüs hayatını renklendirmek için tam fırsat!',
        'Erasmus Topluluğu uluslararası fırsatlar sunuyor. Yurt dışı deneyimi için şimdiden hazırlanmaya başla!',
      ];
      const options = recommendations[dept] || defaultRecs;
      const random = options[Math.floor(Math.random() * options.length)];
      setAiRecommendation(random);
      setAiLoading(false);
    }, 1500);
  };

  const handleSaveGrade = async () => {
    try {
      await api.put('/auth/me', { grade });
      setGradeSaved(true);
      setTimeout(() => setGradeSaved(false), 3000);
    } catch {
      Alert.alert('Hata', 'Sınıf güncellenemedi.');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalı.');
      return;
    }
    try {
      await api.put('/auth/me/password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordSaved(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch {
      setPasswordError('Mevcut şifre yanlış.');
    }
  };

  const fetchData = async () => {
    try {
      const [eventsRes, clubsRes, annRes, myEventsRes, myClubsRes] = 
        await Promise.all([
          api.get('/events'),
          api.get('/clubs'),
          api.get('/announcements?target=student'),
          api.get('/auth/me/events'),
          api.get('/auth/me/clubs'),
        ]);
      setEvents(eventsRes.data);
      setClubs(clubsRes.data);
      setAnnouncements(annRes.data);
      setRegisteredEvents(myEventsRes.data.map(e => String(e.event_id)));
      setJoinedClubs(myClubsRes.data.map(c => c.club_id));
    } catch (err) {
      console.log('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      setRegisteredEvents(prev => [...prev, eventId]);
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? {...e, registered_count: (e.registered_count || 0) + 1}
          : e
      ));
    } catch { }
  };

  const handleUnregister = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}/unregister`);
      setRegisteredEvents(prev => prev.filter(id => id !== eventId));
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? {...e, registered_count: Math.max((e.registered_count || 1) - 1, 0)}
          : e
      ));
    } catch { }
  };

  const handleJoinClub = async (clubId) => {
    try {
      await api.post(`/clubs/${clubId}/join`);
      setJoinedClubs(prev => [...prev, clubId]);
    } catch { }
  };

  const getClubName = (clubId) => 
    clubs.find(c => c.id === clubId)?.name || '';

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { 
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
    });
  };

  // HOME TAB
  const HomeTab = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} 
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          tintColor="#800000" />
      }>

      {/* SKS Duyuruları */}
      {(showAllAnnouncements ? announcements : announcements.slice(0, 2)).map(ann => (
        <View key={ann.id} style={styles.announcementCard}>
          <Text style={styles.announcementBadge}>📢 SKS Duyurusu</Text>
          <Text style={styles.announcementTitle}>{ann.title}</Text>
          <Text style={styles.announcementContent} numberOfLines={2}>
            {ann.content}
          </Text>
        </View>
      ))}

      {announcements.length > 2 && (
        <TouchableOpacity
          onPress={() => setShowAllAnnouncements(!showAllAnnouncements)}
          style={styles.showAllBtn}>
          <Text style={styles.showAllBtnText}>
            {showAllAnnouncements ? 'Daha Az Göster ▲' : `Tümünü Gör (${announcements.length}) ▼`}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.aiCard}>
        <Text style={styles.aiTitle}>✨ AI Etkinlik Önerisi</Text>
        <Text style={styles.aiSubtitle}>Bölümüne göre kişisel öneri</Text>
        
        {!aiRecommendation && !aiLoading && (
          <TouchableOpacity
            style={styles.aiBtn}
            onPress={getMockRecommendation}>
            <Text style={styles.aiBtnText}>Öneri Al →</Text>
          </TouchableOpacity>
        )}

        {aiLoading && (
          <View style={styles.aiLoading}>
            <ActivityIndicator color="rgba(255,255,255,0.8)" size="small" />
            <Text style={styles.aiLoadingText}>Düşünüyor...</Text>
          </View>
        )}

        {aiRecommendation ? (
          <View>
            <Text style={styles.aiText}>{aiRecommendation}</Text>
            <TouchableOpacity onPress={getMockRecommendation}>
              <Text style={styles.aiRefresh}>Yenile ↺</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Önerilen Topluluklar - Yatay */}
      <Text style={styles.sectionTitle}>Önerilen Topluluklar</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.horizontalContent}>
        {clubs.filter(c => !joinedClubs.includes(c.id)).slice(0, 8).map(club => (
          <TouchableOpacity
            key={club.id}
            style={styles.clubChip}
            onPress={() => handleJoinClub(club.id)}>
            <View style={styles.clubChipAvatar}>
              <Text style={styles.clubChipLetter}>
                {club.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.clubChipName} numberOfLines={2}>
              {club.name}
            </Text>
            <Text style={styles.clubChipJoin}>+ Üye Ol</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Etkinlik Feed */}
      <Text style={styles.sectionTitle}>Etkinlikler</Text>
      {events.map(event => {
        const isRegistered = registeredEvents.includes(event.id);
        const isFull = event.capacity && 
          event.registered_count >= event.capacity;
        return (
          <View key={event.id} style={styles.eventCard}>
            {/* Gradient Placeholder */}
            <View style={styles.eventImagePlaceholder}>
              <Text style={styles.eventImageText}>CH</Text>
              <Text style={styles.eventImageSub}>Campus Hub</Text>
            </View>

            <View style={styles.eventBody}>
              <View style={styles.eventHeader}>
                <View style={styles.eventClubAvatar}>
                  <Text style={styles.eventClubLetter}>
                    {getClubName(event.club_id).charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.eventClubName}>
                    {getClubName(event.club_id)}
                  </Text>
                  <Text style={styles.eventDate}>
                    {formatDate(event.event_date)}
                  </Text>
                </View>
              </View>

              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDesc} numberOfLines={2}>
                {event.description}
              </Text>

              <View style={styles.eventFooter}>
                <View style={styles.eventMeta}>
                  <Text style={styles.eventLocation} numberOfLines={1}>
                    📍 {event.location}
                  </Text>
                  <Text style={styles.eventCount}>
                    🔥 {event.registered_count || 0} öğrenci
                  </Text>
                </View>

                {isRegistered ? (
                  <TouchableOpacity
                    style={styles.btnRegistered}
                    onPress={() => handleUnregister(event.id)}>
                    <Text style={styles.btnRegisteredText}>✓ Kayıtlısınız</Text>
                  </TouchableOpacity>
                ) : isFull ? (
                  <View style={styles.btnFull}>
                    <Text style={styles.btnFullText}>Kontenjan Doldu</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.btnRegister}
                    onPress={() => handleRegister(event.id)}>
                    <Text style={styles.btnRegisterText}>Kayıt Ol</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        );
      })}
      <View style={{height: 100}} />
    </ScrollView>
  );

  // CLUBS TAB
  const ClubsTab = () => (
    <ScrollView style={styles.scrollView} 
      showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Tüm Topluluklar</Text>
      {clubs.map(club => (
        <View key={club.id} style={styles.clubCard}>
          <View style={styles.clubCardAvatar}>
            <Text style={styles.clubCardLetter}>
              {club.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.clubCardInfo}>
            <Text style={styles.clubCardName}>{club.name}</Text>
            <Text style={styles.clubCardCategory}>{club.category}</Text>
          </View>
          {joinedClubs.includes(club.id) ? (
            <View style={styles.btnJoined}>
              <Text style={styles.btnJoinedText}>✓ Üye</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.btnJoin}
              onPress={() => handleJoinClub(club.id)}>
              <Text style={styles.btnJoinText}>Üye Ol</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <View style={{height: 100}} />
    </ScrollView>
  );



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>Campus Hub</Text>
        <TouchableOpacity 
          style={styles.navAvatar}
          onPress={() => setActiveTab('profile')}>
          <Text style={styles.navAvatarText}>
            {user?.full_name?.charAt(0) || 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'home' && <HomeTab />}
      {activeTab === 'clubs' && <ClubsTab />}
      {activeTab === 'profile' && <ProfileTab
        user={user}
        registeredEvents={registeredEvents}
        joinedClubs={joinedClubs}
        logout={logout}
        navigate={navigate}
        grade={grade}
        setGrade={setGrade}
        gradeSaved={gradeSaved}
        handleSaveGrade={handleSaveGrade}
        oldPassword={oldPassword}
        setOldPassword={setOldPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        passwordError={passwordError}
        passwordSaved={passwordSaved}
        handleChangePassword={handleChangePassword}
        settingsTab={settingsTab}
        setSettingsTab={setSettingsTab}
        setStatsModal={setStatsModal}
      />}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('home')}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={[styles.tabLabel, 
            activeTab === 'home' && styles.tabLabelActive]}>
            Ana Sayfa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('clubs')}>
          <Text style={styles.tabIcon}>🏛️</Text>
          <Text style={[styles.tabLabel,
            activeTab === 'clubs' && styles.tabLabelActive]}>
            Topluluklar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('profile')}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={[styles.tabLabel,
            activeTab === 'profile' && styles.tabLabelActive]}>
            Profil
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={!!statsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setStatsModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {statsModal === 'events' ? '📅 Kayıtlı Etkinliklerim' : '🏛️ Üye Olduğum Topluluklar'}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {statsModal === 'events' && (
                registeredEvents.length === 0 ? (
                  <Text style={styles.modalEmpty}>Kayıtlı etkinlik yok</Text>
                ) : (
                  events.filter(e => 
                    registeredEvents.some(rid => 
                      String(rid) === String(e.id)
                    )
                  ).map(event => (
                    <View key={event.id} style={styles.modalItem}>
                      <View style={styles.modalItemIcon}>
                        <Text style={styles.modalItemIconText}>📅</Text>
                      </View>
                      <View style={styles.modalItemInfo}>
                        <Text style={styles.modalItemTitle}>{event.title}</Text>
                        <Text style={styles.modalItemSub}>
                          {getClubName(event.club_id)}
                        </Text>
                        <Text style={styles.modalItemSub}>
                          📍 {event.location}
                        </Text>
                      </View>
                    </View>
                  ))
                )
              )}
              {statsModal === 'clubs' && (
                joinedClubs.length === 0 ? (
                  <Text style={styles.modalEmpty}>Üye olunan topluluk yok</Text>
                ) : (
                  clubs.filter(c => joinedClubs.includes(c.id)).map(club => (
                    <View key={club.id} style={styles.modalItem}>
                      <View style={styles.modalItemAvatar}>
                        <Text style={styles.modalItemAvatarText}>
                          {club.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.modalItemInfo}>
                        <Text style={styles.modalItemTitle}>{club.name}</Text>
                        <Text style={styles.modalItemSub}>{club.category}</Text>
                      </View>
                    </View>
                  ))
                )
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setStatsModal(null)}>
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
  
  // Navbar
  navbar: { height: 56, backgroundColor: '#800000', 
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16 },
  navTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  navAvatar: { width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center' },
  navAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // Section
  sectionTitle: { fontSize: 16, fontWeight: 'bold', 
    color: '#1f2937', marginTop: 16, marginBottom: 10 },

  // Announcement
  announcementCard: { backgroundColor: '#fff5f5', borderRadius: 12,
    padding: 14, marginTop: 12, borderLeftWidth: 3, 
    borderLeftColor: '#800000' },
  announcementBadge: { color: '#800000', fontSize: 11, 
    fontWeight: '600', marginBottom: 4 },
  announcementTitle: { color: '#1f2937', fontWeight: 'bold', 
    fontSize: 14, marginBottom: 4 },
  announcementContent: { color: '#6b7280', fontSize: 12 },
  showAllBtn: { 
    alignItems: 'center', 
    paddingVertical: 10,
    marginBottom: 4,
  },
  showAllBtnText: { 
    color: '#800000', 
    fontSize: 13, 
    fontWeight: '600' 
  },

  // Horizontal clubs
  horizontalScroll: { marginHorizontal: -16 },
  horizontalContent: { paddingHorizontal: 16, gap: 10 },
  clubChip: { width: 90, alignItems: 'center', 
    backgroundColor: '#fff', borderRadius: 14, padding: 10,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  clubChipAvatar: { width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#800000', justifyContent: 'center',
    alignItems: 'center', marginBottom: 6 },
  clubChipLetter: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  clubChipName: { color: '#374151', fontSize: 10, textAlign: 'center',
    fontWeight: '600', marginBottom: 4 },
  clubChipJoin: { color: '#800000', fontSize: 10, fontWeight: '600' },

  // Event card
  eventCard: { backgroundColor: '#fff', borderRadius: 16,
    marginBottom: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: {width:0, height:3},
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  eventImagePlaceholder: { height: 140, 
    backgroundColor: '#4a0000',
    justifyContent: 'center', alignItems: 'center' },
  eventImageText: { color: 'rgba(255,255,255,0.3)', 
    fontSize: 36, fontWeight: 'bold' },
  eventImageSub: { color: 'rgba(255,255,255,0.2)', 
    fontSize: 11, marginTop: 2 },
  eventBody: { padding: 14 },
  eventHeader: { flexDirection: 'row', alignItems: 'center', 
    marginBottom: 10 },
  eventClubAvatar: { width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#800000', justifyContent: 'center',
    alignItems: 'center', marginRight: 8 },
  eventClubLetter: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  eventClubName: { color: '#1f2937', fontWeight: '600', fontSize: 13 },
  eventDate: { color: '#9ca3af', fontSize: 11 },
  eventTitle: { color: '#111827', fontWeight: 'bold', 
    fontSize: 15, marginBottom: 4 },
  eventDesc: { color: '#6b7280', fontSize: 12, 
    lineHeight: 18, marginBottom: 10 },
  eventFooter: { flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between' },
  eventMeta: { flex: 1, marginRight: 8 },
  eventLocation: { color: '#6b7280', fontSize: 11 },
  eventCount: { color: '#6b7280', fontSize: 11, marginTop: 2 },
  btnRegister: { backgroundColor: '#800000', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8 },
  btnRegisterText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  btnRegistered: { backgroundColor: '#dcfce7', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8 },
  btnRegisteredText: { color: '#16a34a', fontWeight: '600', fontSize: 12 },
  btnFull: { backgroundColor: '#f3f4f6', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8 },
  btnFullText: { color: '#9ca3af', fontSize: 12 },

  // Clubs tab
  clubCard: { backgroundColor: '#fff', borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', padding: 14,
    marginBottom: 10, shadowColor: '#000', 
    shadowOffset: {width:0, height:2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  clubCardAvatar: { width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#800000', justifyContent: 'center',
    alignItems: 'center', marginRight: 12 },
  clubCardLetter: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  clubCardInfo: { flex: 1 },
  clubCardName: { color: '#1f2937', fontWeight: '600', fontSize: 14 },
  clubCardCategory: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  btnJoin: { backgroundColor: '#800000', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7 },
  btnJoinText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  btnJoined: { backgroundColor: '#dcfce7', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7 },
  btnJoinedText: { color: '#16a34a', fontWeight: '600', fontSize: 12 },

  // Profile tab
  profileCard: { backgroundColor: '#fff', borderRadius: 20,
    padding: 24, alignItems: 'center', marginTop: 16,
    shadowColor: '#000', shadowOffset: {width:0, height:3},
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  profileAvatar: { width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#800000', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12 },
  profileAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 28 },
  profileName: { color: '#1f2937', fontWeight: 'bold', fontSize: 20 },
  profileDept: { color: '#6b7280', fontSize: 13, marginTop: 4 },
  profileGrade: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  profileStats: { backgroundColor: '#fff', borderRadius: 16,
    flexDirection: 'row', marginTop: 12, padding: 16,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatNum: { color: '#800000', fontWeight: 'bold', fontSize: 24 },
  profileStatLabel: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  profileStatDivider: { width: 1, backgroundColor: '#e5e7eb' },
  logoutBtn: { backgroundColor: '#800000', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  settingsTabRow: { flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 12, padding: 4, marginTop: 12,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  settingsTab: { flex: 1, paddingVertical: 10, 
    alignItems: 'center', borderRadius: 10 },
  settingsTabActive: { backgroundColor: '#800000' },
  settingsTabText: { color: '#6b7280', fontWeight: '600', fontSize: 13 },
  settingsTabTextActive: { color: '#fff' },
  settingsCard: { backgroundColor: '#fff', borderRadius: 16,
    padding: 20, marginTop: 12,
    shadowColor: '#000', shadowOffset: {width:0, height:2},
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  settingsTitle: { color: '#1f2937', fontWeight: 'bold',
    fontSize: 16, marginBottom: 6 },
  settingsSubtitle: { color: '#9ca3af', fontSize: 12,
    lineHeight: 18, marginBottom: 16 },
  readOnlyInput: { backgroundColor: '#f9fafb', borderRadius: 12,
    borderWidth: 1, borderColor: '#f3f4f6',
    paddingHorizontal: 16, paddingVertical: 12, marginBottom: 14 },
  readOnlyText: { color: '#9ca3af', fontSize: 14 },
  gradeRow: { flexDirection: 'row', flexWrap: 'wrap', 
    gap: 8, marginBottom: 16 },
  gradeChip: { borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  gradeChipActive: { backgroundColor: '#800000', 
    borderColor: '#800000' },
  gradeChipText: { color: '#6b7280', fontSize: 13 },
  gradeChipTextActive: { color: '#fff', fontWeight: '600' },
  saveBtn: { backgroundColor: '#800000', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  errorText: { color: '#dc2626', fontSize: 12, marginBottom: 10 },
  input: { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14,
    color: '#111827', marginBottom: 14, backgroundColor: '#fafafa' },

  // Tab bar
  tabBar: { flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
    paddingBottom: 20, paddingTop: 10,
    shadowColor: '#000', shadowOffset: {width:0, height:-3},
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 10 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22 },
  tabLabel: { color: '#9ca3af', fontSize: 10, marginTop: 2 },
  tabLabelActive: { color: '#800000', fontWeight: '600' },
  aiCard: { background: 'transparent',
    backgroundColor: '#4a0000', borderRadius: 16,
    padding: 16, marginTop: 12 },
  aiTitle: { color: '#fff', fontWeight: 'bold', 
    fontSize: 14, marginBottom: 2 },
  aiSubtitle: { color: 'rgba(255,255,255,0.6)', 
    fontSize: 11, marginBottom: 12 },
  aiBtn: { backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10, paddingVertical: 10,
    alignItems: 'center' },
  aiBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  aiLoading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiLoadingText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  aiText: { color: 'rgba(255,255,255,0.9)', fontSize: 12,
    lineHeight: 18, marginBottom: 8 },
  aiRefresh: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', 
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '70%' },
  modalTitle: { color: '#1f2937', fontWeight: 'bold',
    fontSize: 18, marginBottom: 16 },
  modalEmpty: { color: '#9ca3af', fontSize: 14,
    textAlign: 'center', paddingVertical: 20 },
  modalItem: { flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6' },
  modalItemIcon: { width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff5f5', justifyContent: 'center',
    alignItems: 'center', marginRight: 12 },
  modalItemIconText: { fontSize: 18 },
  modalItemAvatar: { width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#800000', justifyContent: 'center',
    alignItems: 'center', marginRight: 12 },
  modalItemAvatarText: { color: '#fff', fontWeight: 'bold',
    fontSize: 16 },
  modalItemInfo: { flex: 1 },
  modalItemTitle: { color: '#1f2937', fontWeight: '600',
    fontSize: 14 },
  modalItemSub: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  modalCloseBtn: { backgroundColor: '#800000', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  modalCloseBtnText: { color: '#fff', fontWeight: 'bold',
    fontSize: 15 },
});
