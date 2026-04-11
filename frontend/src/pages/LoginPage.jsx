import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  useEffect(() => {
    if (user) {
      const role = user.role?.trim()
      console.log('useEffect redirect - role:', role)
      if (role === 'sks_staff') navigate('/sks-panel')
      else if (role === 'club_owner') navigate('/dashboard')
      else navigate('/')
    }
  }, [user, navigate])

  const isMobile = windowWidth < 768

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
    } catch (err) {
      const data = err.response?.data || err;
      const detail = data?.detail;

      if (Array.isArray(detail) && detail.length > 0) {
        setError(detail[0].msg || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else if (typeof data?.message === 'string') {
        setError(data.message);
      } else if (typeof err?.message === 'string') {
        setError(err.message);
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
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
      background: 'linear-gradient(135deg, #8B0000 0%, #5a0000 100%)',
      color: '#fff',
      display: isMobile ? 'none' : 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '60px',
      position: 'relative',
      overflow: 'hidden'
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
      maxWidth: '480px'
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
    roleGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginBottom: '32px',
    },
    roleCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 8px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all var(--transition)',
    },
    roleIcon: {
      fontSize: '24px',
      marginBottom: '8px',
    },
    roleLabel: {
      fontSize: '13px',
      fontWeight: '600',
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
    },
    field: { marginBottom: '20px' },
    btn: {
      width: '100%',
      background: '#8B0000',
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
    footer: {
      textAlign: 'center',
      marginTop: '24px',
      fontSize: '14px',
      color: 'var(--text-secondary)',
    },
    link: { color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' },
    formFadeIn: {
      animation: 'fadeIn 0.4s ease forwards',
    }
  }

  const roles = [
    { id: 'student', icon: '🎓', label: 'Öğrenci' },
    { id: 'club', icon: '🏛️', label: 'Topluluk' },
    { id: 'sks', icon: '⚙️', label: 'SKS Personeli' }
  ]

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
          <div style={s.logoText}>Campus Hub</div>
          <div style={s.tagline}>Üniversite ekosisteminizin dijital merkezi</div>
          <div style={s.desc}>
            Kampüs hayatını tek bir ekranda birleştiriyoruz. Öğrenci topluluklarına katılın, etkinlikleri keşfedin ve üniversite deneyiminizi en üst düzeye çıkarın.
          </div>
          <div style={s.featureList}>
            <div style={s.featureItem}>
              <span style={s.featureIcon}>🎓</span> Öğrenci Toplulukları
            </div>
            <div style={s.featureItem}>
              <span style={s.featureIcon}>📅</span> Etkinlik Yönetimi
            </div>
            <div style={s.featureItem}>
              <span style={s.featureIcon}>✅</span> SKS Onay Sistemi
            </div>
          </div>
        </div>

        {/* Sağ Kolon */}
        <div style={s.rightCol}>
          <div style={s.formBox}>
            <h1 style={s.title}>Hoş Geldiniz</h1>
            <div style={s.subtitle}>Devam etmek için giriş yapın</div>

            {error && <div style={s.error}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>}

            <div style={s.roleGrid}>
              {roles.map(r => (
                <div
                  key={r.id}
                  style={{
                    ...s.roleCard,
                    background: selectedRole === r.id ? '#8B0000' : 'white',
                    color: selectedRole === r.id ? 'white' : 'var(--text-primary)',
                    borderColor: selectedRole === r.id ? '#8B0000' : '#ddd',
                  }}
                  onClick={() => {
                    setSelectedRole(r.id)
                    setError('')
                  }}
                >
                  <div style={s.roleIcon}>{r.icon}</div>
                  <div style={s.roleLabel}>{r.label}</div>
                </div>
              ))}
            </div>

            {selectedRole && (
              <div style={s.formFadeIn}>
                <div onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e) }}>
                  <div style={s.field}>
                    <label style={s.label}>E-posta</label>
                    <input
                      style={s.input}
                      type="email"
                      placeholder={selectedRole === 'student' ? "ogrenci@universite.edu.tr" : "eposta@universite.edu.tr"}
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

                {selectedRole === 'student' && (
                  <div style={s.footer}>
                    Hesabınız yok mu?{' '}
                    <Link to="/register" style={s.link}>Kayıt Ol</Link>
                  </div>
                )}
                {selectedRole === 'club' && (
                  <div style={s.footer}>
                    Kulüp başvurusu mu?{' '}
                    <Link to="/register-club" style={s.link}>Kayıt Ol</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
