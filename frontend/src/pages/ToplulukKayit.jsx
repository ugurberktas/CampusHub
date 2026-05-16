import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ToplulukKayit() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [advisorName, setAdvisorName] = useState('');
  const [advisorFaculty, setAdvisorFaculty] = useState('');
  const [advisorEmail, setAdvisorEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleStep1 = () => {
    if (!fullName || !email || !password || !passwordConfirm) {
      setError("Lütfen tüm alanları doldurunuz.");
      return;
    }
    if (!email.endsWith(".edu.tr")) {
      setError("Lütfen .edu.tr uzantılı mail giriniz.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!clubName || !advisorName || !advisorFaculty || !advisorEmail) {
      setError('Lütfen zorunlu alanları doldurunuz.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      // STEP 1: Register user
      const registerRes = await api.post(
        '/auth/register',
        {
          email: email,
          full_name: fullName,
          password: password,
          university: 'firat',
          department: 'Kulüp Başkanı',
          grade: '0'
        }
      )
      const token = registerRes.data.access_token || registerRes.data.token

      // STEP 2: Create club with token
      await api.post(
        '/clubs',
        {
          name: clubName,
          description: description,
          category: category,
          advisor_name: advisorName,
          advisor_faculty: advisorFaculty,
          advisor_email: advisorEmail
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        navigate('/topluluk-girisi')
      }, 3000)
    } catch (err) {
      setLoading(false)
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail)) {
        setError(detail[0]?.msg || 'Kayıt sırasında bir hata oluştu.')
      } else {
        setError('Kayıt sırasında bir hata oluştu.')
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
          <p className="text-white opacity-80 italic text-sm">Topluluğunu kampüse taşı.</p>
        </div>
        <div className="absolute bottom-6 left-6">
          <Link to="/" className="text-white opacity-60 hover:opacity-100 text-sm transition-opacity">
            ← Ana Sayfa
          </Link>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-10 py-8 overflow-y-auto h-screen relative">
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
          {/* STEP INDICATOR */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center w-full max-w-[200px] mb-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === 1 ? 'bg-[#800000] text-white' : 'border-2 border-gray-300 text-gray-400'}`}>
                1
              </div>
              <div className="flex-1 h-px bg-gray-300 mx-2"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === 2 ? 'bg-[#800000] text-white' : 'border-2 border-gray-300 text-gray-400'}`}>
                2
              </div>
            </div>
            <div className="flex justify-between w-full max-w-[240px] text-xs">
              <span className={`text-center w-1/2 ${step === 1 ? 'text-[#800000] font-medium' : 'text-gray-400'}`}>Hesap Bilgileri</span>
              <span className={`text-center w-1/2 ${step === 2 ? 'text-[#800000] font-medium' : 'text-gray-400'}`}>Kulüp Bilgileri</span>
            </div>
          </div>

          {/* ERROR ALERT */}
          {error && !success && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* SUCCESS ALERT */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
              Kaydınız alındı! SKS onayı bekleniyor. Onay sonrası giriş yapabilirsiniz.
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && !success && (
            <div className="space-y-4">
              <div className="mb-6 text-center md:text-left">
                <h1 className="text-2xl font-black text-[#111111] mb-1">Topluluk Başkanı</h1>
                <p className="text-sm text-gray-500">Önce hesabınızı oluşturun</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Ad Soyad</label>
                <input
                  type="text"
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
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>

              <button
                onClick={handleStep1}
                className="w-full bg-[#800000] text-white rounded-lg py-3 font-semibold hover:bg-[#6b0000] transition-colors mt-2"
              >
                Devam Et →
              </button>

              <div className="mt-6 text-center text-sm text-gray-500 pb-8">
                Zaten hesabın var mı?{' '}
                <Link to="/topluluk-girisi" className="text-[#800000] font-medium hover:underline">
                  Giriş Yap
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && !success && (
            <div className="space-y-4">
              <div className="mb-6 text-center md:text-left">
                <h1 className="text-2xl font-black text-[#111111] mb-1">Kulüp Bilgileri</h1>
                <p className="text-sm text-gray-500">Kulübünüzü tanıtın</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Kulüp Adı</label>
                <input
                  type="text"
                  placeholder="Kulüp adı"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Açıklama</label>
                <textarea
                  rows="3"
                  placeholder="Kulübünüzü kısaca tanıtın"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Kategori</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" disabled>Kategori seçin</option>
                  <option value="spor">Spor</option>
                  <option value="muzik">Müzik</option>
                  <option value="teknoloji">Teknoloji</option>
                  <option value="sanat">Sanat</option>
                  <option value="bilim">Bilim</option>
                  <option value="edebiyat">Edebiyat</option>
                  <option value="sosyal">Sosyal</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Danışman Adı</label>
                <input
                  type="text"
                  placeholder="Prof. Dr. Adı Soyadı"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                  value={advisorName}
                  onChange={(e) => setAdvisorName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Danışman Fakültesi</label>
                <input
                  type="text"
                  placeholder="Mühendislik Fakültesi"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                  value={advisorFaculty}
                  onChange={(e) => setAdvisorFaculty(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Danışman E-postası</label>
                <input
                  type="email"
                  placeholder="danisman@firat.edu.tr"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                  value={advisorEmail}
                  onChange={(e) => setAdvisorEmail(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-4 pb-8">
                <button
                  onClick={() => { setStep(1); setError(null); }}
                  className="w-1/2 border border-gray-300 text-gray-600 rounded-lg py-3 font-semibold hover:bg-gray-50 transition-colors"
                >
                  ← Geri
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || success}
                  className="w-1/2 bg-[#800000] text-white rounded-lg py-3 font-semibold hover:bg-[#6b0000] disabled:bg-[#80000080] transition-colors"
                >
                  Kayıt Ol
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
