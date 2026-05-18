import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SksPanel() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { key: 'dashboard', label: 'Genel Bakış', icon: '📊' },
    { key: 'pending', label: 'Onay Bekleyenler', icon: '⏳' },
    { key: 'clubs', label: 'Aktif Topluluklar', icon: '🏢' },
    { key: 'students', label: 'Öğrenci Veritabanı', icon: '👥' },
    { key: 'events', label: 'Etkinlik Radarı', icon: '📅' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <div className="text-gray-400 text-sm">Genel Bakış — gelecek</div>;
      case 'pending':
        return <div className="text-gray-400 text-sm">Onay Bekleyenler — gelecek</div>;
      case 'clubs':
        return <div className="text-gray-400 text-sm">Aktif Topluluklar — gelecek</div>;
      case 'students':
        return <div className="text-gray-400 text-sm">Öğrenci Veritabanı — gelecek</div>;
      case 'events':
        return <div className="text-gray-400 text-sm">Etkinlik Radarı — gelecek</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden font-sans">
      {/* LEFT SIDEBAR */}
      <aside className="flex flex-col w-56 shrink-0 bg-[#800000] h-full text-white">
        {/* TOP: Logo area */}
        <div className="p-5 border-b border-white/20 select-none">
          <div className="font-black text-lg tracking-tight">Campus Hub</div>
          <div className="text-white/60 text-xs mt-0.5">SKS Paneli</div>
        </div>

        {/* MIDDLE: Menu items */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors focus:outline-none select-none ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* BOTTOM: User profile & Logout */}
        <div className="p-3 border-t border-white/20">
          <div className="flex items-center gap-2 mb-2 select-none">
            <div className="w-8 h-8 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">
                {user?.full_name || 'SKS Yetkilisi'}
              </div>
              <div className="text-white/60 text-[10px] mt-0.5">SKS Yetkilisi</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-white/70 text-xs hover:bg-white/10 transition-colors flex items-center gap-2 focus:outline-none select-none"
          >
            <span>🚪</span> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
}
