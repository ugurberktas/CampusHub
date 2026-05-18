import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        <div className="w-64 shrink-0 sticky top-16 h-fit border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-center h-96 text-gray-400 font-medium">
          Sol Kolon
        </div>

        {/* Center Column */}
        <div className="flex-1 border border-gray-200 rounded-xl bg-white p-4 min-h-[600px] flex items-center justify-center text-gray-400 font-medium">
          Ana Akış
        </div>

        {/* Right Column */}
        <div className="w-72 shrink-0 sticky top-16 h-fit border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-center h-[450px] text-gray-400 font-medium">
          Sağ Kolon
        </div>
      </div>
    </div>
  );
}
