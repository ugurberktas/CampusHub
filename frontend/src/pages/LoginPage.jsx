import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '24px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: 'var(--shadow-card)',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoText: {
    fontSize: '26px',
    fontWeight: '800',
    color: 'var(--primary)',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
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
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background var(--transition)',
  },
  error: {
    background: 'rgba(139,0,0,0.15)',
    border: '1px solid rgba(139,0,0,0.3)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: '#ff7070',
    fontSize: '13px',
    marginBottom: '20px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  link: { color: 'var(--primary)', fontWeight: '600' },
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
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

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoText}>Campus Hub</div>
          <div style={s.subtitle}>Hesabınıza giriş yapın</div>
        </div>
        {error && <div style={s.error}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>E-posta</label>
            <input
              style={s.input}
              type="email"
              placeholder="ornek@universitesi.edu.tr"
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
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>
        <div style={s.footer}>
          Hesabınız yok mu?{' '}
          <Link to="/register" style={s.link}>Kayıt Ol</Link>
        </div>
      </div>
    </div>
  )
}
