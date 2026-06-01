import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [showAllAnn, setShowAllAnn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleJoinClub = async (clubId) => {
    try {
      await api.post(`/clubs/${clubId}/join`);
      setJoinedClubs(prev => [...prev, clubId]);
    } catch {
      alert('Zaten bu topluluğun üyesisin!');
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
        const myEventsRes = await api.get('/auth/me/events');
        const myEventIds = myEventsRes.data.map(e => e.event_id);
        setRegisteredEvents(myEventIds);
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    const fetchClubs = async () => {
      try {
        const clubsRes = await api.get('/clubs');
        setClubs(clubsRes.data.slice(-5).reverse());
        const myClubsRes = await api.get('/auth/me/clubs');
        const myClubIds = myClubsRes.data.map(c => c.club_id);
        setJoinedClubs(myClubIds);
      } catch (err) {
        setClubs([]);
      }
    };
    const fetchAnnouncements = async () => {
      try {
        const annRes = await api.get('/announcements?target=student');
        setAnnouncements(annRes.data);
      } catch (err) {
        setAnnouncements([]);
      }
    };
    fetchEvents();
    fetchClubs();
    fetchAnnouncements();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clubs.find(c => c.id === event.club_id)?.name
      ?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClubs = clubs.filter(club =>
    club.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)} 
        />
      )}

      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50 h-16 bg-[#800000] w-full flex items-center justify-between px-6">
        {/* LEFT */}
        <div className="text-white font-bold text-lg select-none">
          Campus Hub
        </div>

        {/* CENTER */}
        <div className="flex-grow flex justify-center">
          <input
            type="text"
            placeholder="Etkinlik veya topluluk ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-1.5 w-2/5 outline-none text-sm"
          />
        </div>

        {/* RIGHT */}
        <div className="relative z-50">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold hover:bg-white/30 transition-colors focus:outline-none select-none"
          >
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </button>

          {/* DROPDOWN */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
              {/* Section 1 */}
              <div className="bg-gray-50 rounded-t-xl p-3">
                <div className="text-gray-800 font-semibold text-sm truncate">
                  {user?.full_name || 'Kullanıcı'}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {user?.department || 'Öğrenci'}
                </div>
              </div>

              {/* Section 2 */}
              <div className="p-1">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  <span>👤</span> Profilim
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  <span>⚙️</span> Ayarlar
                </button>
              </div>

              {/* Section 3 */}
              <div className="border-t border-gray-100 p-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#800000] rounded-lg flex items-center gap-2"
                >
                  <span>🚪</span> Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main 3-Column Layout Container */}
      <div className="w-full max-w-[1128px] mx-auto px-4 py-6">
        <div className="flex flex-row items-start gap-5">
        {/* Left Column */}
        <div className="w-[225px] shrink-0 sticky top-16 h-fit flex flex-col">
          {/* TOP SECTION */}
          <div className="bg-[#800000] rounded-t-xl p-5 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold select-none">
              {getInitials(user?.full_name)}
            </div>
            <div className="text-white font-semibold text-sm text-center truncate w-full">
              {user?.full_name || 'Kullanıcı'}
            </div>
            <div className="text-white/70 text-xs text-center truncate w-full">
              {user?.department || 'Bölüm belirtilmemiş'}
            </div>
          </div>

          {/* MIDDLE SECTION */}
          <div className="bg-white px-4 py-3 border-x border-gray-200 flex items-center gap-2">
            <span className="text-base">🎓</span>
            <span className="text-gray-600 text-sm">
              {user?.grade ? `${user.grade}. Sınıf` : 'Sınıf belirtilmemiş'}
            </span>
          </div>

          {/* BOTTOM SECTION */}
          <div className="bg-white rounded-b-xl px-4 pb-4 border-x border-b border-gray-200">
            <button onClick={() => navigate('/profile')} className="w-full py-2 rounded-lg text-sm text-gray-500 border border-gray-300 hover:border-gray-400 hover:text-gray-700 transition-colors focus:outline-none">
              Profilimi Düzenle
            </button>
          </div>
        </div>

        {/* Center Column */}
        <div className="flex-1 min-w-0 border border-gray-200 rounded-xl bg-white p-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[600px] text-gray-400 text-sm">
              Yükleniyor...
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-3">
              <span className="text-5xl select-none">📅</span>
              <h3 className="text-gray-500 font-semibold text-lg">Henüz etkinlik yok</h3>
              <p className="text-gray-400 text-sm text-center">
                Topluluklar etkinlik oluşturdukça burada görünecek
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
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

              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-gray-200 
                    overflow-hidden mb-4 shadow-sm"
                >
                  {/* Card Header: Club Info */}
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-full bg-[#800000]/10 
                      text-[#800000] font-bold text-sm flex items-center 
                      justify-center shrink-0">
                      {(clubs.find(c => c.id === event.club_id)?.name || 'K').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-gray-800 font-semibold text-sm">
                        {clubs.find(c => c.id === event.club_id)?.name || 'Kampüs Kulübü'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {event.event_date 
                          ? new Date(event.event_date)
                            .toLocaleDateString('tr-TR', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Card Image: edge-to-edge */}
                  {event.image_url ? (
                    <img src={event.image_url}
                      className="w-full h-64 object-cover"
                      alt={event.title} />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br 
                      from-rose-900 to-gray-900 flex flex-col 
                      items-center justify-center gap-2">
                      <div className="text-white/20 text-6xl font-black">
                        CH
                      </div>
                      <p className="text-white/40 text-xs font-medium">
                        Campus Hub
                      </p>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-gray-800 font-bold text-base">
                        {event.title}
                      </h3>
                      {event.capacity && (
                        <span className="shrink-0 text-xs px-2 py-1 
                          rounded-full bg-gray-100 text-gray-500 font-medium">
                          {event.registration_count}/{event.capacity}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs 
                      text-gray-400 mb-3">
                      <span>📍 {event.location}</span>
                      <span>🕐 {event.event_date 
                        ? new Date(event.event_date)
                          .toLocaleTimeString('tr-TR', {
                            hour: '2-digit', minute: '2-digit'
                          })
                        : '-'}
                      </span>
                    </div>

                    {/* Social Proof + Button */}
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-gray-400 text-xs">
                        🔥 {event.registration_count || 0} öğrenci katılıyor
                      </p>

                      {(() => {
                        const isFull = event.capacity !== null && 
                          event.registration_count >= event.capacity;
                        const isRegistered = registeredEvents.includes(event.id);

                        if (isRegistered) return (
                          <button className="px-4 py-2 rounded-xl 
                            bg-green-500 text-white text-sm font-semibold
                            cursor-not-allowed">
                            ✓ Kayıtlısınız
                          </button>
                        );

                        if (isFull) return (
                          <button disabled className="px-4 py-2 rounded-xl 
                            bg-gray-200 text-gray-400 text-sm font-semibold
                            cursor-not-allowed">
                            Kontenjan Doldu
                          </button>
                        );

                        return (
                          <button
                            onClick={async () => {
                              try {
                                await api.post(`/events/${event.id}/register`);
                                setRegisteredEvents(prev => [...prev, event.id]);
                              } catch {
                                alert('Zaten kayıtlısınız!');
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-[#800000] 
                            text-white text-sm font-semibold 
                            hover:bg-[#6b0000] transition-colors">
                            Kayıt Ol
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-[300px] shrink-0 sticky top-16 h-fit border border-gray-200 rounded-xl bg-white p-4">
          <div className="flex flex-col gap-3">
            <p className="text-gray-500 font-semibold text-sm">
              Önerilen Topluluklar
            </p>
            {clubs.length === 0 ? (
              <p className="text-gray-400 text-xs">
                Topluluk bulunamadı
              </p>
            ) : (
              filteredClubs.map(club => (
                <div key={club.id} 
                  className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full 
                    bg-[#800000]/10 text-[#800000] 
                    font-bold text-xs flex items-center 
                    justify-center shrink-0">
                    {club.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm font-medium">
                      {club.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {club.category}
                    </p>
                  </div>

                  {joinedClubs.includes(club.id) ? (
                    <button className="ml-auto px-2 py-1 rounded-lg text-xs bg-green-50 text-green-600 border border-green-200 shrink-0">
                      ✓ Üye
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinClub(club.id)}
                      className="ml-auto px-2 py-1 rounded-lg text-xs border border-gray-300 text-gray-500 hover:border-[#800000] hover:text-[#800000] shrink-0"
                    >
                      Üye Ol
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
