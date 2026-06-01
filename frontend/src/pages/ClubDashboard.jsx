import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function ClubDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    capacity: '',
    salon_id: '',
    image_url: '',
  });
  const [members, setMembers] = useState([]);
  const [salons, setSalons] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [registrationsModal, setRegistrationsModal] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [showAllAnn, setShowAllAnn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await api.get('/clubs');
        // Find the user's club where advisor_email matches or fallback to the first club in list
        const foundClub = response.data.find(
          (c) =>
            c.advisor_email === user?.email ||
            c.name.toLowerCase().includes(user?.full_name?.toLowerCase())
        ) || response.data[0];

        setClub(foundClub || null);
      } catch (err) {
        console.error('Kulüp yüklenirken hata oluştu:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchClub();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get(`/clubs/${club.id}/members`);
        setMembers(response.data);
      } catch (err) {
        console.error('Üyeler yüklenirken hata oluştu:', err);
        setMembers([]);
      }
    };

    if (club && club.status === 'active') {
      fetchMembers();
    }
  }, [club]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        const filtered = response.data.filter((e) => e.club_id === club.id);
        setEvents(filtered);

        const salonsRes = await api.get('/salons');
        setSalons(salonsRes.data);

        const annRes = await api.get('/announcements?target=club_owner');
        setAnnouncements(annRes.data);
      } catch (err) {
        console.error('Etkinlikler yüklenirken hata oluştu:', err);
        setEvents([]);
      }
    };

    if (club) {
      fetchEvents();
    }
  }, [club]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({...prev, image_url: res.data.url}));
    } catch (err) {
      alert('Fotoğraf yüklenemedi.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Etkinliği silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch {
      alert('Etkinlik silinemedi.');
    }
  };

  const handleViewRegistrations = async (event) => {
    try {
      const res = await api.get(`/events/${event.id}/registrations`);
      setRegistrations(res.data);
      setRegistrationsModal(event);
    } catch {
      alert('Kayıtlar yüklenemedi.');
    }
  };

  const handleEditEvent = async () => {
    try {
      await api.put(`/events/${editingEvent.id}`, {
        title: editingEvent.title,
        description: editingEvent.description || '',
        location: editingEvent.location,
        event_date: editingEvent.event_date,
        capacity: editingEvent.capacity 
          ? parseInt(editingEvent.capacity) : null,
        expected_attendance_rate: 
          editingEvent.expected_attendance_rate || 0.7,
        club_id: club.id
      });
      setEvents(prev => prev.map(e => 
        e.id === editingEvent.id ? editingEvent : e
      ));
      setEditingEvent(null);
    } catch {
      alert('Etkinlik güncellenemedi.');
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.location || !formData.start_time) {
      alert('Etkinlik adı, konum ve başlangıç tarihi zorunludur.');
      return;
    }
    try {
      await api.post('/events', {
        club_id: club.id,
        title: formData.title,
        description: formData.description || null,
        location: formData.location,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        event_date: formData.start_time,
        expected_attendance_rate: 0.7
      });

      if (formData.salon_id) {
        await api.post('/salon_reservations', {
          salon_id: formData.salon_id,
          club_id: club.id,
          reservation_date: formData.start_time.split('T')[0],
          time_slot: formData.start_time.split('T')[1]
        });
      }

      setShowForm(false);
      setFormData({
        title: '', description: '', location: '',
        start_time: '', end_time: '', capacity: '',
        salon_id: '', image_url: ''
      });
      const res = await api.get('/events');
      const filtered = res.data.filter((e) => e.club_id === club.id);
      setEvents(filtered);
    } catch (err) {
      alert('Etkinlik oluşturulamadı.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] font-sans">
        <div className="text-gray-400 text-sm animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  if (!club || club.status === 'pending' || club.status === 'rejected') {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center gap-4 max-w-md text-center">
          <span className="text-5xl animate-bounce select-none">⏳</span>
          <h2 className="text-gray-800 font-bold text-xl">
            Başvurunuz İnceleniyor
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            SKS yetkilisi kulübünüzü onayladıktan sonra panele erişebileceksiniz.
          </p>
          <button
            onClick={logout}
            className="mt-4 px-6 py-2 rounded-lg text-sm text-gray-500 border border-gray-300 hover:border-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    );
  }

  if (club.status === 'active') {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
        {/* Navbar */}
        <div className="sticky top-0 z-50 h-16 bg-[#800000] w-full flex items-center justify-between px-6">
          {/* Left: Logo */}
          <span className="text-white font-bold text-lg">
            Campus Hub
          </span>

          {/* Center: Search */}
          <input
            type="text"
            placeholder="Etkinlik veya topluluk ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-1.5 w-64 outline-none text-sm"
          />

          {/* Right: Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm"
            >
              {club.name.charAt(0).toUpperCase()}
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                  {/* Section 1: Club Info */}
                  <div className="bg-gray-50 rounded-t-xl p-3">
                    <p className="text-gray-800 font-semibold text-sm">
                      {club.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {user?.full_name}
                    </p>
                  </div>

                  {/* Section 2: Links */}
                  <div className="p-1">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      👤 Kulüp Profili
                    </button>
                    <button onClick={() => { setDropdownOpen(false); navigate('/club-settings'); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      ⚙️ Ayarlar
                    </button>
                  </div>

                  {/* Section 3: Logout */}
                  <div className="border-t border-gray-100 p-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#800000] rounded-lg"
                    >
                      🚪 Çıkış Yap
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3 Column Layout */}
        <div className="flex flex-row gap-6 px-6 py-4 w-full">
          {/* Left Column */}
          <div className="w-64 shrink-0 sticky top-16 h-fit flex flex-col">
            {/* Top: Club Avatar + Name */}
            <div className="bg-[#800000] rounded-t-xl p-5 flex flex-col items-center gap-2">
              {club.logo_url ? (
                <img 
                  src={club.logo_url} 
                  alt={club.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold select-none">
                  {club.name.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-white font-semibold text-sm text-center truncate w-full">
                {club.name}
              </p>
              <p className="text-white/70 text-xs text-center truncate w-full">
                {club.category || 'Kategori belirtilmemiş'}
              </p>
            </div>

            {/* Middle: Stats */}
            <div className="bg-white px-4 py-3 border-x border-gray-200 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">👥</span>
                <span className="text-gray-600 text-sm">
                  {members.length} Üye
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">📅</span>
                <span className="text-gray-600 text-sm">
                  {club.event_count || 0} Etkinlik
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🏛️</span>
                <span className="text-gray-600 text-sm truncate">
                  {club.advisor_name || 'Danışman belirtilmemiş'}
                </span>
              </div>
            </div>

            {/* Bottom: Edit Button */}
            <div className="bg-white rounded-b-xl px-4 pb-4 border-x border-b border-gray-200">
              <button onClick={() => navigate('/club-settings')} className="w-full py-2 rounded-lg text-sm text-gray-500 border border-gray-300 hover:border-gray-400 hover:text-gray-700 transition-colors focus:outline-none">
                Kulübü Düzenle
              </button>
            </div>
          </div>

          {/* Center Column */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Announcements Banner */}
            {announcements.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-col gap-2">
                  {(showAllAnn ? announcements : announcements.slice(0, 2)).map((ann, index) => (
                    <div
                      key={ann.id}
                      className={`bg-red-50 border-l-4 border-[#800000] rounded-xl p-4 transition-opacity ${
                        !showAllAnn && index === 1 && announcements.length > 2 ? 'opacity-40' : 'opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#800000] bg-red-100 px-2 py-0.5 rounded-full">
                          📌 SKS Duyurusu
                        </span>
                      </div>
                      <p className="text-gray-800 font-semibold text-sm">{ann.title}</p>
                      <p className="text-gray-600 text-xs mt-1">{ann.content}</p>
                    </div>
                  ))}
                </div>
                {announcements.length > 2 && (
                  <button
                    onClick={() => setShowAllAnn(!showAllAnn)}
                    className="mt-2 text-xs text-[#800000] hover:underline w-full text-center"
                  >
                    {showAllAnn ? '▲ Daha az göster' : `▼ Tümünü gör (${announcements.length} duyuru)`}
                  </button>
                )}
              </div>
            )}

            {/* Create Event Button / Form Toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 rounded-lg bg-[#800000] text-white font-semibold text-sm hover:bg-[#6b0000] transition-colors focus:outline-none"
                >
                  + Yeni Etkinlik Oluştur
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      Yeni Etkinlik
                    </h3>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-gray-400 hover:text-gray-600 text-sm focus:outline-none"
                    >
                      İptal
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Etkinlik adı *"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000] transition-colors"
                  />

                  <textarea
                    placeholder="Açıklama"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none h-20 focus:border-[#800000] transition-colors"
                  />

                  <input
                    type="text"
                    placeholder="Konum *"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000] transition-colors"
                  />

                  <select
                    value={formData.salon_id}
                    onChange={e => setFormData({...formData, salon_id: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000] transition-colors text-gray-700">
                    <option value="">Salon seçin (opsiyonel)</option>
                    {salons.map(salon => (
                      <option key={salon.id} value={salon.id}>
                        {salon.name} ({salon.capacity} kişilik)
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">
                      Etkinlik Afişi (opsiyonel)
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImageUpload}
                      className="w-full border border-gray-200 rounded-lg 
                      px-3 py-2 text-sm text-gray-600
                      file:mr-3 file:py-1 file:px-3 file:rounded-lg 
                      file:border-0 file:bg-[#800000] file:text-white 
                      file:text-xs file:cursor-pointer cursor-pointer"
                    />
                    {formData.image_url && (
                      <img 
                        src={formData.image_url} 
                        alt="Afiş önizleme"
                        className="w-full h-32 object-cover rounded-lg mt-1"
                      />
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs text-gray-400">Başlangıç</label>
                      <input
                        type="datetime-local"
                        value={formData.start_time}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            start_time: e.target.value,
                          })
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000] transition-colors"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs text-gray-400">Bitiş</label>
                      <input
                        type="datetime-local"
                        value={formData.end_time}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) =>
                          setFormData({ ...formData, end_time: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000] transition-colors"
                      />
                    </div>
                  </div>

                  <input
                    type="number"
                    placeholder="Kontenjan (opsiyonel)"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000] transition-colors"
                  />

                  <button
                    onClick={handleCreateEvent}
                    className="w-full py-2.5 rounded-lg bg-[#800000] text-white font-semibold text-sm hover:bg-[#6b0000] transition-colors focus:outline-none"
                  >
                    Etkinliği Kaydet
                  </button>
                </div>
              )}
            </div>

            {/* Events List */}
            {searchQuery && filteredEvents.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8">
                <span className="text-3xl">🔍</span>
                <p className="text-gray-400 text-sm">
                  "{searchQuery}" için sonuç bulunamadı
                </p>
              </div>
            )}
            {events.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center gap-3 animate-fade-in">
                <span className="text-4xl select-none">📅</span>
                <p className="text-gray-500 font-semibold text-sm">
                  Henüz etkinlik yok
                </p>
                <p className="text-gray-400 text-xs text-center">
                  İlk etkinliğini oluşturmak için yukarıdaki butona tıkla
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 flex flex-col">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-row items-center justify-between p-4 hover:bg-gray-50/50 transition-colors gap-4"
                  >
                    {/* Sol: Etkinlik Afişi */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      {event.image_url ? (
                        <img 
                          src={event.image_url} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#800000] to-rose-900 flex flex-col items-center justify-center text-white text-[10px] font-bold select-none gap-0.5">
                          <span>CH</span>
                          <span className="text-[6px] opacity-70">Campus Hub</span>
                        </div>
                      )}
                    </div>

                    {/* Orta: Detaylar */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-850 text-sm sm:text-base truncate">
                        {event.title}
                      </h4>
                      <div className="flex flex-col gap-1 mt-1 text-xs text-gray-500">
                        <span className="truncate">
                          📅 {event.event_date 
                            ? new Date(event.event_date).toLocaleString('tr-TR', {
                                day: '2-digit', month: 'long', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })
                            : 'Tarih belirtilmemiş'}
                        </span>
                        <span className="truncate">📍 {event.location || '-'}</span>
                        <span className="font-medium text-[#800000]">
                          👤 {event.registration_count || 0} kayıtlı
                        </span>
                      </div>
                    </div>

                    {/* Sağ: Butonlar */}
                    <div className="flex flex-col gap-1 shrink-0 w-32">
                      <button
                        onClick={() => handleViewRegistrations(event)}
                        className="w-full py-1 px-2 rounded border border-[#800000] text-[#800000] text-xs font-semibold hover:bg-[#800000]/5 transition-colors focus:outline-none text-center"
                      >
                        Kayıt Olanları
                      </button>
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="w-full py-1 px-2 rounded border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors focus:outline-none text-center"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="w-full py-1 px-2 rounded border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors focus:outline-none text-center"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="w-72 shrink-0 sticky top-16 h-fit border border-gray-200 rounded-lg bg-white p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-gray-800 text-sm">Üyeler</h3>

            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="text-3xl select-none">👥</span>
                <p className="text-gray-400 text-sm">Henüz üye yok</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#800000]/10 text-[#800000] font-bold text-xs flex items-center justify-center shrink-0 select-none">
                      {member.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-sm font-medium truncate max-w-[120px]">
                        {member.full_name || 'İsimsiz Üye'}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {member.department || member.user?.department || member.role || 'Üye'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {registrationsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
              
              {/* Modal Header */}
              <div className="bg-[#800000] p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-base">
                    Kayıt Olanlar
                  </h3>
                  <p className="text-white/70 text-xs mt-0.5">
                    {registrationsModal.title}
                  </p>
                </div>
                <button
                  onClick={() => setRegistrationsModal(null)}
                  className="text-white/70 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 max-h-96 overflow-y-auto">
                {registrations.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <span className="text-3xl">👥</span>
                    <p className="text-gray-400 text-sm">
                      Henüz kayıt olan yok
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {registrations.map((student, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-[#800000]/10 text-[#800000] font-bold text-sm flex items-center justify-center shrink-0">
                          {student.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-sm">
                            {student.full_name || 'İsimsiz'}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {student.department || '-'} {student.grade ? `• ${student.grade}. Sınıf` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100">
                <p className="text-gray-400 text-xs text-center">
                  Toplam {registrations.length} kayıt
                </p>
              </div>
            </div>
          </div>
        )}

        {editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
              
              <div className="bg-[#800000] p-5 flex items-center justify-between">
                <h3 className="text-white font-bold text-base">
                  Etkinliği Düzenle
                </h3>
                <button onClick={() => setEditingEvent(null)}
                  className="text-white/70 hover:text-white text-xl">
                  ✕
                </button>
              </div>

              <div className="p-5 flex flex-col gap-3">
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={e => setEditingEvent({
                    ...editingEvent, title: e.target.value
                  })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000]"
                  placeholder="Etkinlik adı"
                />
                <textarea
                  value={editingEvent.description || ''}
                  onChange={e => setEditingEvent({
                    ...editingEvent, description: e.target.value
                  })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000] resize-none h-20"
                  placeholder="Açıklama"
                />
                <input
                  type="text"
                  value={editingEvent.location}
                  onChange={e => setEditingEvent({
                    ...editingEvent, location: e.target.value
                  })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000]"
                  placeholder="Konum"
                />
                <input
                  type="datetime-local"
                  value={editingEvent.event_date?.slice(0,16)}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={e => setEditingEvent({
                    ...editingEvent, event_date: e.target.value
                  })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000]"
                />
                <input
                  type="number"
                  value={editingEvent.capacity || ''}
                  onChange={e => setEditingEvent({
                    ...editingEvent, capacity: e.target.value
                  })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000]"
                  placeholder="Kontenjan (opsiyonel)"
                />
                <button
                  onClick={handleEditEvent}
                  className="w-full py-2.5 rounded-lg bg-[#800000] text-white font-semibold text-sm hover:bg-[#6b0000]">
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
