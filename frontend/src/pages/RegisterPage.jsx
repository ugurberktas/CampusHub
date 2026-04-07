import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

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
    maxWidth: '440px',
    boxShadow: 'var(--shadow-card)',
  },
  logo: { textAlign: 'center', marginBottom: '32px' },
  logoText: { fontSize: '26px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' },
  input: {
    width: '100%',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
  },
  field: { marginBottom: '18px' },
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
  success: {
    background: 'rgba(0,160,80,0.12)',
    border: '1px solid rgba(0,160,80,0.3)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: '#4ade80',
    fontSize: '13px',
    marginBottom: '20px',
  },
  footer: { textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' },
  link: { color: 'var(--primary)', fontWeight: '600' },
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz…')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setError(err.response?.data?.detail || 'Kayıt başarısız. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoText}>Campus Hub</div>
          <div style={s.subtitle}>Yeni hesap oluşturun</div>
        </div>
        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Ad Soyad</label>
            <input style={s.input} type="text" placeholder="Ahmet Yılmaz" value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>E-posta</label>
            <input style={s.input} type="email" placeholder="ornek@universitesi.edu.tr" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Şifre</label>
            <input style={s.input} type="password" placeholder="En az 8 karakter" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Kayıt oluşturuluyor…' : 'Kayıt Ol'}
          </button>
        </form>
        <div style={s.footer}>
          Zaten hesabınız var mı?{' '}
          <Link to="/login" style={s.link}>Giriş Yap</Link>
        </div>
      </div>
    </div>
  )
}
