import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SKSLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const userData = await login(form.email, form.password)
      const role = userData?.role?.trim()
      if (role === 'sks_staff') {
        // /sks-panel rotası kaldırıldı — yönlendirme devre dışı
        setError('SKS Paneli şu an bakımda. Lütfen daha sonra tekrar deneyin.')
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
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      background: '#ffffff',
    },
    formBox: {
      width: '100%',
      maxWidth: '420px',
      padding: '24px',
    },
    logo: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#8B0000',
      letterSpacing: '-0.5px',
      marginBottom: '32px',
      textAlign: 'center',
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
      background: '#8B0000',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      padding: '14px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
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
    link: {
      color: '#8B0000',
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
        <div style={{ ...s.formBox, animation: 'fadeIn 0.4s ease forwards' }}>
          <div style={s.logo}>Campus Hub</div>

          <h1 style={s.title}>SKS Personel Girişi</h1>
          <div style={s.subtitle}>Yetkili hesabınızla giriş yapın</div>

          {error && (
            <div style={s.error}>
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          <div onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e) }}>
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

          <div style={s.footer}>
            Öğrenci girişi için{' '}
            <Link to="/login" style={s.link}>tıklayın</Link>
          </div>
        </div>
      </div>
    </>
  )
}
