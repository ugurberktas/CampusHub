import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SKSLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowWidth < 768

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const userData = await login(form.email, form.password)
      const role = userData?.role?.trim()
      if (role === 'sks_staff') {
        navigate('/sks-panel')
      } else {
        setError('Bu hesap SKS Personeli yetkisine sahip değil.')
      }
    } catch (err) {
      const data = err.response?.data || err
      const detail = data?.detail

      if (Array.isArray(detail) && detail.length > 0) {
        setError(detail[0].msg || 'Giriş başarısız. Bilgilerinizi kontrol edin.')
      } else if (typeof detail === 'string') {
        setError(detail)
      } else if (typeof data?.message === 'string') {
        setError(data.message)
      } else if (typeof err?.message === 'string') {
        setError(err.message)
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      }
    } finally {
      setLoading(false)
    }
  }

  const s = {
    page: {
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      background: 'var(--bg)',
    },
    leftCol: {
      flex: 1,
      background: 'linear-gradient(135deg, #1a237e 0%, #0d1257 100%)',
      color: '#fff',
      display: isMobile ? 'none' : 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '60px',
      position: 'relative',
      overflow: 'hidden',
    },
    rightCol: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    },
    formBox: {
      width: '100%',
      maxWidth: '420px',
    },
    logoText: {
      fontSize: '48px',
      fontWeight: '800',
      letterSpacing: '-1px',
      marginBottom: '16px',
    },
    tagline: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px',
      opacity: 0.9,
    },
    desc: {
      fontSize: '16px',
      lineHeight: '1.6',
      marginBottom: '40px',
      opacity: 0.8,
      maxWidth: '480px',
    },
    featureList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '18px',
      fontWeight: '500',
    },
    featureIcon: {
      fontSize: '24px',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(255,255,255,0.15)',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '999px',
      padding: '6px 16px',
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '24px',
      backdropFilter: 'blur(8px)',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '15px',
      color: 'var(--text-secondary)',
      marginBottom: '32px',
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      color: 'var(--text-secondary)',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '12px 16px',
      color: 'var(--text-primary)',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color var(--transition)',
      boxSizing: 'border-box',
    },
    field: { marginBottom: '20px' },
    btn: {
      width: '100%',
      background: '#1a237e',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      padding: '14px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '8px',
      transition: 'opacity var(--transition)',
      opacity: loading ? 0.7 : 1,
    },
    error: {
      background: 'rgba(139,0,0,0.1)',
      border: '1px solid rgba(139,0,0,0.3)',
      borderRadius: 'var(--radius-sm)',
      padding: '12px 16px',
      color: '#d32f2f',
      fontSize: '14px',
      marginBottom: '24px',
      fontWeight: '500',
    },
    backLink: {
      textAlign: 'center',
      marginTop: '24px',
      fontSize: '14px',
      color: 'var(--text-secondary)',
    },
    link: {
      color: '#1a237e',
      fontWeight: '600',
      textDecoration: 'none',
    },
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={s.page}>
        {/* Sol Kolon */}
        <div style={s.leftCol}>
          <div style={s.badge}>⚙️ Yetkili Personel Girişi</div>
          <div style={s.logoText}>Campus Hub</div>
          <div style={s.tagline}>SKS Yönetim Paneli</div>
          <div style={s.desc}>
            Öğrenci Kültür ve Spor Dairesi personeline özel yönetim arayüzü. Topluluk başvurularını, etkinlikleri ve kullanıcı hesaplarını buradan yönetebilirsiniz.
          </div>
          <div style={s.featureList}>
            <div style={s.featureItem}>
              <span style={s.featureIcon}>🏛️</span> Topluluk Başvuru Yönetimi
            </div>
            <div style={s.featureItem}>
              <span style={s.featureIcon}>📅</span> Etkinlik Takip Sistemi
            </div>
            <div style={s.featureItem}>
              <span style={s.featureIcon}>👥</span> Kullanıcı Yönetimi
            </div>
          </div>
        </div>

        {/* Sağ Kolon */}
        <div style={s.rightCol}>
          <div style={{ ...s.formBox, animation: 'fadeIn 0.4s ease forwards' }}>
            <h1 style={s.title}>SKS Personel Girişi</h1>
            <div style={s.subtitle}>Yetkili personel hesabınızla giriş yapın</div>

            {error && <div style={s.error}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>}

            <div
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e) }}
            >
              <div style={s.field}>
                <label style={s.label}>E-posta</label>
                <input
                  style={s.input}
                  type="email"
                  placeholder="personel@universite.edu.tr"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Şifre</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <button
                style={s.btn}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
              </button>
            </div>

            <div style={s.backLink}>
              Öğrenci misiniz?{' '}
              <a href="/login" style={s.link}>Öğrenci Girişi</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
