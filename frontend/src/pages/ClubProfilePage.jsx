import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ClubProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const response = await api.get('/clubs');
        // Find the user's club where advisor_email matches or fallback to the first club in list
        const foundClub = response.data.find(
          (c) =>
            c.advisor_email === user?.email ||
            c.name.toLowerCase().includes(user?.full_name?.toLowerCase())
        ) || response.data[0];

        if (foundClub) {
          setClub(foundClub);
          
          // Fetch members
          const membersRes = await api.get(`/clubs/${foundClub.id}/members`);
          setMembers(membersRes.data);

          // Fetch and filter events
          const eventsRes = await api.get('/events');
          const filteredEvents = eventsRes.data.filter((e) => e.club_id === foundClub.id);
          setEvents(filteredEvents);
        }
      } catch (err) {
        console.error('Error fetching club profile data:', err);
      }
    };

    if (user) {
      fetchClubData();
    }
  }, [user]);

  if (!club) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center font-sans">
        <p className="text-gray-400 text-sm animate-pulse">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)} 
        />
      )}

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
          readOnly
        />

        {/* Right: Profile Dropdown */}
        <div className="relative z-50">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm hover:bg-white/30 transition-colors focus:outline-none"
          >
            {club.name.charAt(0).toUpperCase()}
          </button>

          {dropdownOpen && (
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
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/club-profile'); }}
                  className="w-full text-left px-3 py-2 text-sm text-[#800000] bg-[#800000]/5 rounded-lg font-semibold flex items-center gap-2"
                >
                  <span>👤</span> Kulüp Profili
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/club-settings'); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  <span>⚙️</span> Ayarlar
                </button>
              </div>

              {/* Section 3: Logout */}
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

      {/* Content Area */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/club-dashboard')}
          className="text-gray-400 text-sm hover:text-gray-700 mb-6 block transition-colors font-medium"
        >
          ← Dashboard&apos;a Dön
        </button>

        {/* Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column (col-span-4) */}
          <div className="col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              
              {/* Top section */}
              <div className="bg-[#800000] p-6 flex flex-col items-center gap-2">
                {club.logo_url ? (
                  <img 
                    src={club.logo_url} 
                    alt={club.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 text-white text-3xl font-bold flex items-center justify-center select-none">
                    {club.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="text-white font-bold text-lg text-center mt-2 truncate w-full">
                  {club.name}
                </h2>
                <p className="text-white/70 text-sm truncate w-full text-center">
                  {club.category || 'Kategori belirtilmemiş'}
                </p>
              </div>

              {/* Bottom section */}
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>👥</span>
                  <span>{members.length} Üye</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>📅</span>
                  <span>{events.length} Etkinlik</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>🏛️</span>
                  <span className="truncate">{club.advisor_name || 'Danışman belirtilmemiş'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <span>📧</span>
                  <span className="truncate">{club.advisor_email || 'E-posta belirtilmemiş'}</span>
                </div>
                
                {club.description && (
                  <>
                    <div className="border-t border-gray-100 pt-3 mt-2" />
                    <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                      {club.description}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (col-span-8) */}
          <div className="col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              
              <h3 className="font-bold text-gray-800 text-lg mb-4">
                Etkinlikler
              </h3>

              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <span className="text-5xl select-none">📅</span>
                  <p className="text-gray-400 text-sm font-medium">
                    Henüz etkinlik yok
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {events.map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100/50 transition-colors rounded-xl mb-2"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-800 text-sm block truncate">
                          {event.title}
                        </span>
                        <span className="text-gray-400 text-xs mt-0.5 block truncate">
                          📍 {event.location || 'Konum belirtilmemiş'}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs shrink-0 pl-3">
                        {event.event_date 
                          ? new Date(event.event_date).toLocaleDateString('tr-TR')
                          : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
