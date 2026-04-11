import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function StudentRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', department: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

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
      padding: '40px',
      width: '100%',
      maxWidth: '420px',
      boxShadow: 'var(--shadow-card)',
    },
    logo: {
      textAlign: 'center',
      marginBottom: '16px',
      fontSize: '28px',
      fontWeight: '800',
      color: 'var(--primary)',
      letterSpacing: '-1px',
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '24px',
      color: 'var(--text-primary)',
    },
    field: { marginBottom: '16px' },
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
      marginTop: '16px',
      transition: 'opacity var(--transition)',
      opacity: loading ? 0.7 : 1,
    },
    error: {
      background: 'rgba(139,0,0,0.1)',
      border: '1px solid rgba(139,0,0,0.3)',
      borderRadius: 'var(--radius-sm)',
      padding: '12px',
      color: '#d32f2f',
      fontSize: '14px',
      marginBottom: '20px',
      fontWeight: '500'
    },
    success: {
      background: 'rgba(46, 125, 50, 0.1)',
      border: '1px solid rgba(46, 125, 50, 0.3)',
      borderRadius: 'var(--radius-sm)',
      padding: '12px',
      color: '#2e7d32',
      fontSize: '14px',
      marginBottom: '20px',
      fontWeight: '500'
    },
    footer: {
      textAlign: 'center',
      marginTop: '24px',
      fontSize: '14px',
      color: 'var(--text-secondary)',
    },
    link: { color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' },
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (form.password !== form.confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        email: form.email,
        full_name: form.full_name,
        password: form.password,
        department: form.department
      })
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const data = err.response?.data || err
      let msg = 'Bir hata oluştu. Lütfen tekrar deneyin.'
      if (data?.detail) {
        msg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail
      } else if (data?.message) {
        msg = data.message
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Campus Hub</div>
        <div style={s.title}>Öğrenci Kaydı</div>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Ad Soyad</label>
            <input
              style={s.input}
              type="text"
              placeholder="Adınız Soyadınız"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>

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
            <label style={s.label}>Bölüm (Opsiyonel)</label>
            <input
              style={s.input}
              type="text"
              placeholder="Bilgisayar Mühendisliği"
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Şifre</label>
            <input
              style={s.input}
              type="password"
              placeholder="En az 8 karakter"
              minLength="8"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Şifre Tekrar</label>
            <input
              style={s.input}
              type="password"
              placeholder="Şifrenizi tekrar girin"
              minLength="8"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button style={s.btn} type="submit" disabled={loading || success}>
            {loading ? 'Kayıt Yapılıyor…' : 'Kayıt Ol'}
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
