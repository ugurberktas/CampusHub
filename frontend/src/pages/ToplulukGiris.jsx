import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ToplulukGiris() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      if (user.role === 'club_owner') {
        navigate('/club-dashboard');
      } else if (user.role === 'student') {
        setError('role_error_student');
      } else if (user.role === 'sks_staff') {
        setError('role_error_sks');
      } else {
        setError('role_error_generic');
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail;
      if (typeof errMsg === 'string' && errMsg.toLowerCase().includes('role')) {
        setError('role_error_generic');
      } else {
        setError(errMsg || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* LEFT HALF */}
      <div className="hidden md:flex w-1/2 bg-[#800000] flex-col justify-center items-center relative">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-white mb-2">
            <span className="text-4xl">◈</span>
            <span className="text-3xl font-bold tracking-tight">Campus Hub</span>
          </div>
          <p className="text-white opacity-80 italic text-sm">Topluluğunun merkezi.</p>
        </div>
        <div className="absolute bottom-6 left-6">
          <Link to="/" className="text-white opacity-60 hover:opacity-100 text-sm transition-opacity">
            ← Ana Sayfa
          </Link>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-10 h-screen relative">
        {/* CLICKABLE LOGO (desktop, inside right panel top) */}
        <div className="hidden md:flex absolute top-6 left-8 items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl text-[#800000]">◈</span>
            <span className="font-bold text-[#800000] text-lg tracking-tight">Campus Hub</span>
          </Link>
        </div>

        {/* TOP LOGO (mobile only, md:hidden) */}
        <div className="md:hidden flex justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl text-[#800000]">◈</span>
            <span className="font-bold text-[#800000] text-xl tracking-tight">Campus Hub</span>
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto">
          {/* HEADING SECTION */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-2xl font-black text-[#111111] mb-1">Topluluk Girişi</h1>
            <p className="text-sm text-gray-500">Fırat Üniversitesi toplulukları için</p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error === 'role_error_student' ? (
                <>
                  Bu giriş formu yalnızca topluluk sahiplerine özeldir.
                  Öğrenci girişi için → <Link to="/ogrenci-girisi" className="text-red-700 font-bold underline">Öğrenci Girişi</Link>
                </>
              ) : error === 'role_error_sks' || error === 'role_error_generic' ? (
                "Bu giriş formu yalnızca topluluk sahiplerine özeldir."
              ) : (
                error
              )}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">E-posta</label>
              <input
                type="email"
                required
                placeholder="ornek@firat.edu.tr"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Şifre</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800000] text-white rounded-lg py-3 font-semibold hover:bg-[#6b0000] disabled:bg-[#80000080] transition-colors"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* REGISTER LINK */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Hesabın yok mu?{' '}
            <Link to="/topluluk-kayit" className="text-[#800000] font-medium hover:underline">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
