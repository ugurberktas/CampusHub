import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function OgrenciKayit() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [grade, setGrade] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.endsWith('.edu.tr')) {
      setError('Lütfen geçerli bir .edu.tr uzantılı e-posta adresi giriniz.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        email: email,
        full_name: fullName,
        password: password,
        university: 'firat',
        department: department,
        grade: grade
      });

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/ogrenci-girisi');
      }, 2500);

    } catch (err) {
      setLoading(false);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail) && detail.length > 0) {
        setError(detail[0].msg);
      } else {
        setError('Kayıt sırasında bir hata oluştu.');
      }
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
          <p className="text-white opacity-80 italic text-sm">Kampüs hayatına ilk adım.</p>
        </div>
        <div className="absolute bottom-6 left-6">
          <Link to="/" className="text-white opacity-60 hover:opacity-100 text-sm transition-opacity">
            ← Ana Sayfa
          </Link>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-10 h-screen relative py-8 overflow-y-auto">
        {/* CLICKABLE LOGO (desktop, inside right panel top) */}
        <div className="hidden md:flex absolute top-6 left-8 items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl text-[#800000]">◈</span>
            <span className="font-bold text-[#800000] text-lg tracking-tight">Campus Hub</span>
          </Link>
        </div>

        {/* TOP LOGO (mobile only, md:hidden) */}
        <div className="md:hidden flex justify-center mb-8 mt-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl text-[#800000]">◈</span>
            <span className="font-bold text-[#800000] text-xl tracking-tight">Campus Hub</span>
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto">
          {/* HEADING SECTION */}
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-2xl font-black text-[#111111] mb-1">Öğrenci Kaydı</h1>
            <p className="text-sm text-gray-500">Fırat Üniversitesi öğrencilerine özel</p>
          </div>

          {/* SUCCESS ALERT */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
              Kaydınız başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...
            </div>
          )}

          {/* ERROR ALERT */}
          {error && !success && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Ad Soyad</label>
              <input
                type="text"
                required
                placeholder="Adınız Soyadınız"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

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
              <label className="block text-sm font-medium text-[#374151] mb-1">Bölüm</label>
              <input
                type="text"
                required
                placeholder="Bilgisayar Mühendisliği"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Sınıf</label>
              <select
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="" disabled>Sınıfınızı seçin</option>
                <option value="0">Hazırlık</option>
                <option value="1">1. Sınıf</option>
                <option value="2">2. Sınıf</option>
                <option value="3">3. Sınıf</option>
                <option value="4">4. Sınıf</option>
                <option value="5">5. Sınıf</option>
                <option value="6">6. Sınıf</option>
              </select>
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

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Şifre Tekrar</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-[#800000] text-white rounded-lg py-3 font-semibold hover:bg-[#6b0000] disabled:bg-[#80000080] transition-colors mt-2"
            >
              {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </button>
          </form>

          {/* LOGIN LINK */}
          <div className="mt-6 text-center text-sm text-gray-500 pb-8">
            Zaten hesabın var mı?{' '}
            <Link to="/ogrenci-girisi" className="text-[#800000] font-medium hover:underline">
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
