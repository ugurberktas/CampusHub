import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ClubSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('club');
  const [club, setClub] = useState(null);

  // Editable fields
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [clubSaved, setClubSaved] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Notification toggles
  const [notifSKS, setNotifSKS] = useState(true);
  const [notifEvent, setNotifEvent] = useState(true);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const myClubsRes = await api.get('/auth/me/clubs');
        const ownerClub = myClubsRes.data.find(c => c.role === 'owner');
        const targetClubId = ownerClub ? ownerClub.club_id : null;

        const clubsRes = await api.get('/clubs');
        const foundClub = clubsRes.data.find(c => c.id === targetClubId);

        if (foundClub) {
          setClub(foundClub);
          setDescription(foundClub.description || '');
          setLogoUrl(foundClub.logo_url || '');
          setBannerUrl(foundClub.banner_url || '');
        } else {
          // Fallback to searching by advisor_email or name if not found in active list or /me/clubs is empty
          const fallbackClub = clubsRes.data.find(
            (c) =>
              c.advisor_email === user?.email ||
              c.name.toLowerCase().includes(user?.full_name?.toLowerCase())
          ) || clubsRes.data[0];
          
          if (fallbackClub) {
            setClub(fallbackClub);
            setDescription(fallbackClub.description || '');
            setLogoUrl(fallbackClub.logo_url || '');
            setBannerUrl(fallbackClub.banner_url || '');
          }
        }
      } catch (err) {
        console.error('Club fetch error:', err);
      }
    };

    if (user) {
      fetchClubData();
    }
  }, [user]);

  const handleSaveClub = async () => {
    if (!club) return;
    try {
      await api.put('/clubs/' + club.id, {
        description,
        logo_url: logoUrl,
        banner_url: bannerUrl
      });
      setClubSaved(true);
      setTimeout(() => setClubSaved(false), 3000);
    } catch (err) {
      alert('Kaydedilemedi.');
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalı.');
      return;
    }
    try {
      await api.put('/auth/me/password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      setPasswordSaved(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch {
      setPasswordError('Mevcut şifre yanlış.');
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex flex-col font-sans">
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
            readOnly
          />
        </div>

        {/* RIGHT */}
        <div className="relative z-50">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm"
          >
            {club?.name ? club.name.charAt(0).toUpperCase() : 'C'}
          </button>

          {/* DROPDOWN */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
              {/* Section 1 */}
              <div className="bg-gray-50 rounded-t-xl p-3">
                <div className="text-gray-800 font-semibold text-sm truncate">
                  {club?.name || 'Kulüp'}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {user?.full_name || 'Kulüp Sahibi'}
                </div>
              </div>

              {/* Section 2 */}
              <div className="p-1">
                <button
                  onClick={() => navigate('/club-dashboard')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  <span>👤</span> Kulüp Profili
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-[#800000] bg-[#800000]/5 rounded-lg flex items-center gap-2 font-semibold"
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

      {/* Content Area */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/club-dashboard')}
          className="text-gray-400 text-sm hover:text-gray-700 mb-6 block transition-colors"
        >
          ← Dashboard&apos;a Dön
        </button>

        {/* Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Navigation Column */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              {/* Avatar & Club Info */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#800000]/10 text-[#800000] font-bold text-2xl flex items-center justify-center select-none">
                  {club?.name ? club.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="text-center w-full">
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {club?.name || 'Yükleniyor...'}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    {club?.category || 'Kategori'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 my-3" />

              {/* Navigation Links */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveSection('club')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === 'club'
                      ? 'bg-[#800000]/10 text-[#800000] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🏢 Kulüp Bilgileri
                </button>
                <button
                  onClick={() => setActiveSection('password')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === 'password'
                      ? 'bg-[#800000]/10 text-[#800000] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🔒 Güvenlik
                </button>
                <button
                  onClick={() => setActiveSection('notifications')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === 'notifications'
                      ? 'bg-[#800000]/10 text-[#800000] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🔔 Bildirimler
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Column */}
          <div className="col-span-9">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              
              {/* SECTION 1: Kulüp Bilgileri */}
              {activeSection === 'club' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-2">
                    Kulüp Bilgileri
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Resmi bilgiler SKS tarafından belirlenir ve değiştirilemez.
                  </p>

                  {/* Read-only fields 2x2 grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">
                        Kulüp Adı
                      </label>
                      <input
                        type="text"
                        value={club?.name || ''}
                        readOnly
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-sm cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">
                        Kategori
                      </label>
                      <input
                        type="text"
                        value={club?.category || ''}
                        readOnly
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-sm cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">
                        Danışman
                      </label>
                      <input
                        type="text"
                        value={club?.advisor_name || ''}
                        readOnly
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-sm cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">
                        Danışman E-posta
                      </label>
                      <input
                        type="text"
                        value={club?.advisor_email || ''}
                        readOnly
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-6" />

                  {/* Editable fields */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">
                        Kulüp Açıklaması
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm outline-none focus:border-[#800000] resize-none h-24"
                        placeholder="Kulüp hakkında açıklama yazın..."
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm outline-none focus:border-[#800000]"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">
                        Banner URL
                      </label>
                      <input
                        type="text"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm outline-none focus:border-[#800000]"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={handleSaveClub}
                      className="bg-[#800000] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#6b0000] transition-colors font-semibold"
                    >
                      Kaydet
                    </button>
                    {clubSaved && (
                      <span className="text-green-500 text-sm font-medium animate-fade-in">
                        ✓ Kaydedildi
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 2: Şifre Değiştir */}
              {activeSection === 'password' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg mb-1">
                      Şifre Değiştir
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                      Güvenliğiniz için şifrenizi düzenli aralıklarla değiştirmenizi öneririz.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 max-w-md">
                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">
                        Mevcut Şifre
                      </label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm outline-none focus:border-[#800000]"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">
                        Yeni Şifre
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm outline-none focus:border-[#800000]"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1 block">
                        Yeni Şifre (Tekrar)
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm outline-none focus:border-[#800000]"
                        placeholder="••••••••"
                      />
                    </div>

                    {passwordError && (
                      <p className="text-red-500 text-xs font-medium">{passwordError}</p>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleUpdatePassword}
                        className="bg-[#800000] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#6b0000] transition-colors font-semibold"
                      >
                        Şifreyi Güncelle
                      </button>
                      {passwordSaved && (
                        <span className="text-green-500 text-sm font-medium">✓ Şifre güncellendi</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: Bildirim Tercihleri */}
              {activeSection === 'notifications' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg mb-1">
                      Bildirim Tercihleri
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                      Hangi bildirimleri almak istediğinizi seçin.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 max-w-md">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-gray-800 font-semibold text-sm">📢 SKS Duyuruları</p>
                        <p className="text-gray-400 text-xs mt-0.5">SKS tarafından yapılan resmi duyurular</p>
                      </div>
                      <button
                        onClick={() => setNotifSKS(!notifSKS)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${notifSKS ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${notifSKS ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-gray-800 font-semibold text-sm">📅 Etkinlik Hatırlatmaları</p>
                        <p className="text-gray-400 text-xs mt-0.5">Kayıtlı olduğunuz etkinlikler yaklaşınca bildir</p>
                      </div>
                      <button
                        onClick={() => setNotifEvent(!notifEvent)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${notifEvent ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${notifEvent ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
