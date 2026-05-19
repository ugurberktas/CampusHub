import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [myEvents, setMyEvents] = useState([]);
  const [myClubs, setMyClubs] = useState([]);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const res = await api.get('/auth/me/events');
        setMyEvents(res.data);
      } catch (err) {
        setMyEvents([]);
      }
    };
    
    const fetchMyClubs = async () => {
      try {
        const res = await api.get('/auth/me/clubs');
        setMyClubs(res.data);
      } catch (err) {
        setMyClubs([]);
      }
    };

    fetchMyEvents();
    fetchMyClubs();
  }, []);

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

      {/* CONTENT AREA */}
      <div className="max-w-5xl mx-auto w-full px-6 py-6 flex-1 flex flex-col">
        {/* Back button */}
        <button 
          onClick={() => navigate('/student-dashboard')}
          className="text-gray-400 text-sm hover:text-gray-700 self-start mb-6"
        >
          ← Dashboard'a Dön
        </button>

        <div className="flex gap-6 w-full">
          {/* Left Column */}
          <div className="w-72 shrink-0 flex flex-col gap-4">

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              
              {/* Top: Avatar + Info */}
              <div className="bg-[#800000] p-6 flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full bg-white/20 
                  flex items-center justify-center 
                  text-white text-3xl font-bold">
                  {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <p className="text-white font-bold text-base text-center">
                  {user?.full_name}
                </p>
                <p className="text-white/70 text-xs text-center">
                  {user?.department}
                </p>
              </div>

              {/* Middle: Details */}
              <div className="p-4 flex flex-col gap-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎓</span>
                  <span className="text-gray-600 text-sm">
                    {user?.grade ? `${user.grade}. Sınıf` : 'Sınıf belirtilmemiş'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">📧</span>
                  <span className="text-gray-600 text-sm">
                    {user?.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">👥</span>
                  <span className="text-gray-600 text-sm">
                    {myClubs.length} Topluluk Üyeliği
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">📅</span>
                  <span className="text-gray-600 text-sm">
                    {myEvents.length} Etkinlik Kaydı
                  </span>
                </div>
              </div>

              {/* Bottom: Back Button */}
              <div className="p-4">
                <button
                  onClick={() => navigate('/student-dashboard')}
                  className="w-full py-2 rounded-lg text-sm
                  text-gray-500 border border-gray-300
                  hover:border-gray-400 hover:text-gray-700">
                  ← Dashboard'a Dön
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">

            {/* Tab Headers */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('events')}
                className={`flex-1 py-3 text-sm font-semibold
                  ${activeTab === 'events' 
                    ? 'text-[#800000] border-b-2 border-[#800000]' 
                    : 'text-gray-400 hover:text-gray-600'}`}>
                📅 Etkinliklerim ({myEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('clubs')}
                className={`flex-1 py-3 text-sm font-semibold
                  ${activeTab === 'clubs' 
                    ? 'text-[#800000] border-b-2 border-[#800000]' 
                    : 'text-gray-400 hover:text-gray-600'}`}>
                👥 Topluluklarım ({myClubs.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div className="flex flex-col gap-3">
                  {myEvents.length === 0 ? (
                    <div className="flex flex-col items-center 
                      gap-2 py-12">
                      <span className="text-4xl">📅</span>
                      <p className="text-gray-400 text-sm">
                        Henüz etkinliğe kayıt olmadınız
                      </p>
                    </div>
                  ) : (
                    myEvents.map(event => (
                      <div key={event.event_id}
                        className="flex items-center justify-between
                        p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-gray-800 font-semibold text-sm">
                            {event.event_title}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            📍 {event.event_location}
                          </p>
                          <p className="text-gray-400 text-xs">
                            📅 {event.event_date 
                              ? new Date(event.event_date)
                                .toLocaleDateString('tr-TR')
                              : '-'}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            if (!window.confirm('Kayıt iptal edilsin mi?')) return;
                            try {
                              await api.delete(`/events/${event.event_id}/unregister`);
                              setMyEvents(prev => 
                                prev.filter(e => e.event_id !== event.event_id)
                              );
                            } catch {
                              alert('İptal edilemedi.');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs
                          border border-red-200 text-red-500
                          hover:bg-red-50 shrink-0">
                          İptal
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Clubs Tab */}
              {activeTab === 'clubs' && (
                <div className="flex flex-col gap-3">
                  {myClubs.length === 0 ? (
                    <div className="flex flex-col items-center 
                      gap-2 py-12">
                      <span className="text-4xl">👥</span>
                      <p className="text-gray-400 text-sm">
                        Henüz bir topluluğa üye olmadınız
                      </p>
                    </div>
                  ) : (
                    myClubs.map(club => (
                      <div key={club.club_id}
                        className="flex items-center justify-between
                        p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full 
                            bg-[#800000]/10 text-[#800000] 
                            font-bold text-sm flex items-center 
                            justify-center shrink-0">
                            {club.club_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-gray-800 font-semibold text-sm">
                              {club.club_name}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {club.club_category}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (!window.confirm(
                              `${club.club_name} topluluğundan ayrılmak istediğinize emin misiniz?`
                            )) return;
                            try {
                              await api.delete(`/clubs/${club.club_id}/leave`);
                              setMyClubs(prev => 
                                prev.filter(c => c.club_id !== club.club_id)
                              );
                            } catch {
                              alert('Ayrılınamadı.');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs
                          border border-red-200 text-red-500
                          hover:bg-red-50 shrink-0">
                          Ayrıl
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
