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
          <div className="w-72 shrink-0">
            Sol Kolon
          </div>

          {/* Right Column */}
          <div className="flex-1">
            Sağ Kolon
          </div>
        </div>
      </div>
    </div>
  );
}
