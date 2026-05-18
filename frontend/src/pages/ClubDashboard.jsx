import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ClubDashboard() {
  const { user, logout } = useAuth();
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
  });
  const [members, setMembers] = useState([]);

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
      } catch (err) {
        console.error('Etkinlikler yüklenirken hata oluştu:', err);
        setEvents([]);
      }
    };

    if (club) {
      fetchEvents();
    }
  }, [club]);

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.location || !formData.start_time) {
      alert('Etkinlik adı, konum ve başlangıç tarihi zorunludur.');
      return;
    }
    try {
      await api.post('/events', {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        club_id: club.id
      });
      setShowForm(false);
      setFormData({
        title: '', description: '', location: '',
        start_time: '', end_time: '', capacity: ''
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
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-400 rounded-lg cursor-not-allowed opacity-50" disabled>
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
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold select-none">
                {club.name.charAt(0).toUpperCase()}
              </div>
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
                  {club.member_count || 0} Üye
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
              <button className="w-full py-2 rounded-lg text-sm text-gray-500 border border-gray-300 hover:border-gray-400 hover:text-gray-700 transition-colors focus:outline-none">
                Kulübü Düzenle
              </button>
            </div>
          </div>

          {/* Center Column */}
          <div className="flex-1 flex flex-col gap-4">
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

                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs text-gray-400">Başlangıç</label>
                      <input
                        type="datetime-local"
                        value={formData.start_time}
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
              <div className="flex flex-col gap-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="min-w-0 flex flex-col gap-1">
                      <h4 className="font-semibold text-gray-800 text-sm truncate">
                        {event.title}
                      </h4>
                      <p className="text-gray-400 text-xs truncate">
                        📍 {event.location || '-'}
                      </p>
                    </div>
                    <span className="text-gray-400 text-xs shrink-0 font-medium bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                      📅 {new Date(event.start_time).toLocaleDateString('tr-TR')}
                    </span>
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
                      {(member.full_name || member.user?.full_name || member.role || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-sm font-medium truncate">
                        {member.full_name || member.user?.full_name || 'Kulüp Üyesi'}
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
      </div>
    );
  }

  return null;
}
