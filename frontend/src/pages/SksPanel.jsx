import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function SksPanel() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [pendingClubs, setPendingClubs] = useState([]);
  const [activeClubs, setActiveClubs] = useState([]);
  const [students, setStudents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/sks/stats');
        setStats(response.data);
      } catch (err) {
        console.error('İstatistikler yüklenirken hata oluştu:', err);
        setStats(null);
      }
    };

    const fetchPendingClubs = async () => {
      try {
        const response = await api.get('/clubs/pending');
        setPendingClubs(response.data);
      } catch (err) {
        console.error('Onay bekleyen kulüpler yüklenirken hata oluştu:', err);
        setPendingClubs([]);
      }
    };

    const fetchActiveClubs = async () => {
      try {
        const response = await api.get('/clubs');
        const active = response.data.filter((c) => c.status === 'active');
        setActiveClubs(active);
      } catch (err) {
        console.error('Aktif kulüpler yüklenirken hata oluştu:', err);
        setActiveClubs([]);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await api.get('/auth/users');
        const filtered = response.data.filter((u) => u.role === 'student');
        setStudents(filtered);
      } catch (err) {
        console.error('Öğrenciler yüklenirken hata oluştu:', err);
        setStudents([]);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setAllEvents(response.data);
      } catch (err) {
        console.error('Etkinlikler yüklenirken hata oluştu:', err);
        setAllEvents([]);
      }
    };

    fetchStats();
    fetchPendingClubs();
    fetchActiveClubs();
    fetchStudents();
    fetchEvents();
  }, []);

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
        return (
          <div className="w-full flex flex-col justify-start">
            <h2 className="font-bold text-gray-800 text-xl mb-6">Genel Bakış</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2">
                <span className="text-2xl select-none">👥</span>
                <span className="text-3xl font-black text-gray-800">
                  {stats?.total_students ?? stats?.total_users ?? 0}
                </span>
                <span className="text-sm text-gray-400">Kayıtlı Öğrenci</span>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2">
                <span className="text-2xl select-none">🏢</span>
                <span className="text-3xl font-black text-gray-800">
                  {stats?.active_clubs ?? stats?.total_clubs ?? 0}
                </span>
                <span className="text-sm text-gray-400">Aktif Topluluk</span>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2">
                <span className="text-2xl select-none">⏳</span>
                <span
                  className={`text-3xl font-black ${
                    (stats?.pending_clubs ?? 0) > 0 ? 'text-[#800000]' : 'text-gray-800'
                  }`}
                >
                  {stats?.pending_clubs ?? 0}
                </span>
                <span className="text-sm text-gray-400">Onay Bekleyen</span>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2">
                <span className="text-2xl select-none">📅</span>
                <span className="text-3xl font-black text-gray-800">
                  {stats?.total_events ?? 0}
                </span>
                <span className="text-sm text-gray-400">Toplam Etkinlik</span>
              </div>
            </div>
          </div>
        );
      case 'pending':
        return (
          <div className="w-full flex flex-col justify-start">
            <h2 className="font-bold text-gray-800 text-xl mb-6">
              Onay Bekleyen Topluluklar
            </h2>

            {pendingClubs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-5xl select-none">⏳</span>
                <p className="text-gray-400 text-sm">Onay bekleyen topluluk yok</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingClubs.map((club) => (
                  <div
                    key={club.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between shadow-sm"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#800000]/10 text-[#800000] font-bold text-sm flex items-center justify-center shrink-0 select-none">
                        {club.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-800 text-base truncate">
                          {club.name}
                        </h4>
                        <p className="text-gray-400 text-sm mt-0.5">
                          📂 {club.category || 'Kategori belirtilmemiş'}
                        </p>
                        <p className="text-gray-400 text-sm mt-0.5">
                          👤 Danışman: {club.advisor_name || 'Belirtilmemiş'} ({club.advisor_email})
                        </p>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            await api.put(`/clubs/${club.id}/approve`);
                            setPendingClubs(pendingClubs.filter((c) => c.id !== club.id));
                            // Refresh stats dynamically
                            const statsRes = await api.get('/sks/stats');
                            setStats(statsRes.data);
                          } catch (err) {
                            console.error('Kulüp onaylanırken hata oluştu:', err);
                          }
                        }}
                        className="px-5 py-2.5 rounded-lg text-base bg-green-500 text-white hover:bg-green-600 font-medium transition-colors focus:outline-none"
                      >
                        ✓ Onayla
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await api.put(`/clubs/${club.id}/reject`);
                            setPendingClubs(pendingClubs.filter((c) => c.id !== club.id));
                            // Refresh stats dynamically
                            const statsRes = await api.get('/sks/stats');
                            setStats(statsRes.data);
                          } catch (err) {
                            console.error('Kulüp reddedilirken hata oluştu:', err);
                          }
                        }}
                        className="px-5 py-2.5 rounded-lg text-base bg-red-500 text-white hover:bg-red-600 font-medium transition-colors focus:outline-none"
                      >
                        ✗ Reddet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'clubs':
        return (
          <div className="w-full flex flex-col justify-start">
            <h2 className="font-bold text-gray-800 text-xl mb-6">
              Aktif Topluluklar
            </h2>

            {activeClubs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-5xl select-none">🏢</span>
                <p className="text-gray-400 text-sm">Henüz aktif topluluk yok</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeClubs.map((club) => (
                  <div
                    key={club.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between shadow-sm"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#800000]/10 text-[#800000] font-bold text-sm flex items-center justify-center shrink-0 select-none">
                        {club.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-800 text-base truncate">
                          {club.name}
                        </h4>
                        <p className="text-gray-400 text-sm mt-0.5">
                          📂 {club.category || 'Kategori belirtilmemiş'}
                        </p>
                        <p className="text-gray-400 text-sm mt-0.5">
                          👤 Danışman: {club.advisor_name || 'Belirtilmemiş'} ({club.advisor_email})
                        </p>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            await api.put(`/clubs/${club.id}/suspend`);
                            setActiveClubs(activeClubs.filter((c) => c.id !== club.id));
                            // Refresh stats dynamically
                            const statsRes = await api.get('/sks/stats');
                            setStats(statsRes.data);
                          } catch (err) {
                            console.error('Topluluk askıya alınırken hata oluştu:', err);
                          }
                        }}
                        className="px-5 py-2.5 rounded-lg text-sm bg-yellow-500 text-white hover:bg-yellow-600 font-medium transition-colors focus:outline-none"
                      >
                        ⏸ Askıya Al
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'students':
        return (
          <div className="w-full flex flex-col justify-start">
            <h2 className="font-bold text-gray-800 text-xl mb-1">
              Öğrenci Veritabanı
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              {students.length} öğrenci kayıtlı
            </p>

            <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Öğrenci
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Bölüm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sınıf
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#800000]/10 text-[#800000] text-xs font-bold flex items-center justify-center shrink-0 select-none">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'Ö'}
                          </div>
                          <span className="text-gray-800 font-medium truncate max-w-[160px]">
                            {user.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-100 text-gray-600 truncate max-w-[150px]">
                        {user.department || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-100 text-gray-600">
                        {user.grade ? `${user.grade}. Sınıf` : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs border-b border-gray-100 text-gray-400 truncate max-w-[180px]">
                        {user.email}
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-400 text-sm">
                        Kayıtlı öğrenci bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'events':
        return (
          <div className="w-full flex flex-col justify-start">
            <h2 className="font-bold text-gray-800 text-xl mb-6">
              Etkinlik Radarı
            </h2>

            {allEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-5xl select-none">📅</span>
                <p className="text-gray-400 text-sm">Henüz etkinlik yok</p>
              </div>
            ) : (
              <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Etkinlik
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Konum
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Kontenjan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="hover:bg-gray-50 border-b border-gray-100 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium truncate max-w-[180px]">
                          {event.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]">
                          {event.location || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {event.event_date
                            ? new Date(event.event_date).toLocaleDateString('tr-TR')
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {event.capacity ? `${event.capacity} kişi` : 'Sınırsız'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
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
      <main className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa] flex flex-col">
        {renderContent()}
      </main>
    </div>
  );
}
