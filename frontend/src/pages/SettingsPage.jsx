import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [grade, setGrade] = useState(user?.grade || '');
  const [gradeSaved, setGradeSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [notifSKS, setNotifSKS] = useState(true);
  const [notifEvent, setNotifEvent] = useState(true);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
  };

  const handleSaveGrade = async () => {
    try {
      await api.put('/auth/me', { grade });
      setGradeSaved(true);
      setTimeout(() => setGradeSaved(false), 3000);
    } catch {
      // silently fail
    }
  };

  const navLinks = [
    { key: 'profile', label: '👤 Profil Bilgileri' },
    { key: 'password', label: '🔒 Şifre Değiştir' },
    { key: 'notifications', label: '🔔 Bildirim Tercihleri' },
  ];

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
          onClick={() => navigate('/student-dashboard')}
          className="text-gray-400 text-sm hover:text-gray-700 mb-4 transition-colors"
        >
          ← Dashboard&apos;a Dön
        </button>

        {/* Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Navigation Column */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              {/* Avatar & User Info */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#800000]/10 text-[#800000] font-bold text-2xl flex items-center justify-center select-none">
                  {getInitials(user?.full_name)}
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800 text-sm">
                    {user?.full_name || 'Kullanıcı'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {user?.department || 'Bölüm belirtilmemiş'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {user?.email || ''}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 my-3" />

              {/* Navigation Links */}
              <div className="flex flex-col gap-1">
                {navLinks.map(link => (
                  <button
                    key={link.key}
                    onClick={() => setActiveSection(link.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === link.key
                        ? 'bg-[#800000]/10 text-[#800000] font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Column */}
          <div className="col-span-9">
            <div className="bg-white rounded-xl border border-gray-200 p-6">

              {/* SECTION: Profil Bilgileri */}
              {activeSection === 'profile' && (
                <div>
                  <h2 className="font-bold text-gray-800 text-lg mb-1">
                    Profil Bilgileri
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Aşağıdaki bilgiler üniversite kayıt sisteminizden gelmektedir ve değiştirilemez.
                  </p>

                  {/* Read-only fields 2x2 grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Ad Soyad', value: user?.full_name },
                      { label: 'E-posta', value: user?.email },
                      { label: 'Bölüm', value: user?.department || 'Belirtilmemiş' },
                      { label: 'Öğrenci No', value: user?.student_no || 'Belirtilmemiş' },
                    ].map(field => (
                      <div key={field.label}>
                        <p className="text-xs text-gray-400 font-medium mb-1">
                          {field.label}
                        </p>
                        <input
                          type="text"
                          value={field.value || ''}
                          readOnly
                          className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-sm cursor-not-allowed"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 my-6" />

                  {/* Editable: Sınıf */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Sınıf</p>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-48 px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm outline-none focus:border-[#800000]"
                    >
                      <option value="">Seçin</option>
                      <option value="Hazırlık">Hazırlık</option>
                      <option value="1">1. Sınıf</option>
                      <option value="2">2. Sınıf</option>
                      <option value="3">3. Sınıf</option>
                      <option value="4">4. Sınıf</option>
                      <option value="5">5. Sınıf</option>
                      <option value="6">6. Sınıf</option>
                    </select>

                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={handleSaveGrade}
                        className="bg-[#800000] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#6b0000] transition-colors"
                      >
                        Kaydet
                      </button>
                      {gradeSaved && (
                        <span className="text-green-500 text-sm">✓ Kaydedildi</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: Şifre Değiştir */}
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
                      <input type="password"
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
                      <input type="password"
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
                      <input type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm outline-none focus:border-[#800000]"
                        placeholder="••••••••"
                      />
                    </div>

                    {passwordError && (
                      <p className="text-red-500 text-xs">{passwordError}</p>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
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
                        }}
                        className="bg-[#800000] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#6b0000] transition-colors">
                        Şifreyi Güncelle
                      </button>
                      {passwordSaved && (
                        <span className="text-green-500 text-sm">✓ Şifre güncellendi</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: Bildirim Tercihleri */}
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
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${notifSKS ? 'bg-green-500' : 'bg-gray-300'}`}>
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
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${notifEvent ? 'bg-green-500' : 'bg-gray-300'}`}>
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
