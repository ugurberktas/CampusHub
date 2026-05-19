import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
  };

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
            className="bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-1.5 w-64 outline-none text-sm"
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
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <span>👤</span> Profilim
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 cursor-not-allowed opacity-50" disabled>
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
      <div className="flex flex-row gap-6 px-6 py-4 w-full flex-1">
        {/* Left Column */}
        <div className="w-64 shrink-0 sticky top-16 h-fit flex flex-col">
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
            <button className="w-full py-2 rounded-lg text-sm text-gray-500 border border-gray-300 hover:border-gray-400 hover:text-gray-700 transition-colors focus:outline-none">
              Profilimi Düzenle
            </button>
          </div>
        </div>

        {/* Center Column */}
        <div className="flex-1 border border-gray-200 rounded-xl bg-white p-4">
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
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4 flex flex-col gap-2">
                    <h4 className="font-bold text-gray-800 text-base">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-gray-600 text-sm">
                        {event.description}
                      </p>
                    )}
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-gray-400 text-sm flex items-center gap-1.5">
                        📍 {event.location || 'Konum belirtilmemiş'}
                      </span>
                      <span className="text-gray-400 text-sm flex items-center gap-1.5">
                        📅 {event.event_date
                          ? new Date(event.event_date).toLocaleDateString('tr-TR')
                          : 'Tarih belirtilmemiş'}
                      </span>
                    </div>
                    {registeredEvents.includes(event.id) ? (
                      <button className="w-full mt-3 py-2.5 rounded-lg bg-green-500 text-white font-semibold text-sm cursor-not-allowed">
                        ✓ Kayıtlısınız
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            await api.post(`/events/${event.id}/register`);
                            setRegisteredEvents(prev => [...prev, event.id]);
                          } catch {
                            alert('Zaten kayıtlısınız!');
                          }
                        }}
                        className="w-full mt-3 py-2.5 rounded-lg bg-[#800000] text-white font-semibold text-sm hover:bg-[#6b0000] transition-colors focus:outline-none"
                      >
                        Kayıt Ol
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-72 shrink-0 sticky top-16 h-fit border border-gray-200 rounded-xl bg-white p-4">
          <div className="flex flex-col gap-3">
            <h4 className="text-gray-500 font-semibold text-sm">Önerilen Topluluklar</h4>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 h-3 rounded bg-gray-100" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 h-3 rounded bg-gray-100" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 h-3 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
