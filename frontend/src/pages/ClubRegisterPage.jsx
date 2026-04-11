import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function ClubRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    club_name: '', category: 'Spor', description: '',
    advisor_name: '', advisor_faculty: '', advisor_email: '', logo_url: '',
    full_name: '', club_email: '', email: '', phone: '', password: '', confirmPassword: ''
  })
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
      maxWidth: '480px',
      boxShadow: 'var(--shadow-card)',
    },
    logo: {
      textAlign: 'center',
      marginBottom: '24px',
      fontSize: '28px',
      fontWeight: '800',
      color: 'var(--primary)',
      letterSpacing: '-1px',
    },
    indicatorContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '32px',
    },
    stepItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '600',
    },
    circle: (isActive) => ({
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: isActive ? 'var(--primary)' : 'var(--bg-surface)',
      color: isActive ? '#fff' : 'var(--text-secondary)',
      border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all var(--transition)'
    }),
    line: {
      width: '40px',
      height: '2px',
      background: 'var(--border)',
    },
    field: { marginBottom: '16px' },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      color: 'var(--text-secondary)',
      marginBottom: '8px',
    },
    note: {
      fontSize: '11px',
      color: 'var(--text-muted)',
      display: 'block',
      marginTop: '4px'
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
    select: {
      width: '100%',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '12px 16px',
      color: 'var(--text-primary)',
      fontSize: '14px',
      outline: 'none',
    },
    textarea: {
      width: '100%',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '12px 16px',
      color: 'var(--text-primary)',
      fontSize: '14px',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical'
    },
    btnPrimary: {
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
    btnSecondary: {
      width: '100%',
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '14px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'background var(--transition)',
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

  const handleNext = (e) => {
    e.preventDefault()
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (form.password !== form.confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      setLoading(false)
      return
    }

    try {
      // 1. Üye kaydı
      const regRes = await api.post('/auth/register', {
        email: form.email,
        full_name: form.full_name,
        password: form.password,
        department: 'Kulüp Yöneticisi'
      })
      
      // 2. Token yönetimi (Register token dönmezse manuel login fallback)
      let tokenValue = regRes.data?.access_token || regRes.data?.token
      if (!tokenValue) {
        const loginRes = await api.post('/auth/login', { username: form.email, password: form.password })
        tokenValue = loginRes.data.access_token
      }
      localStorage.setItem('token', tokenValue)

      // 3. Kulüp başvurusu
      await api.post('/clubs', {
        name: form.club_name,
        category: form.category,
        description: form.description,
        advisor_name: form.advisor_name,
        advisor_faculty: form.advisor_faculty,
        advisor_email: form.advisor_email,
        logo_url: form.logo_url
      })
      
      // 4. Başarılı durum
      setSuccess('Başvurunuz alındı! SKS onayından sonra aktif olacaktır.')
      setTimeout(() => navigate('/login'), 3000)
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
        
        <div style={s.indicatorContainer}>
          <div style={s.stepItem}>
            <div style={s.circle(step >= 1)}>1</div>
            <span style={{ color: step >= 1 ? 'var(--text-primary)' : 'var(--text-secondary)'}}>Topluluk Bilgileri</span>
          </div>
          <div style={s.line}></div>
          <div style={s.stepItem}>
            <div style={s.circle(step >= 2)}>2</div>
            <span style={{ color: step >= 2 ? 'var(--text-primary)' : 'var(--text-secondary)'}}>Yetkili Bilgileri</span>
          </div>
        </div>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        <form onSubmit={step === 1 ? handleNext : handleSubmit}>
          {step === 1 && (
            <>
              <div style={s.field}>
                <label style={s.label}>Topluluk Adı</label>
                <input
                  style={s.input}
                  type="text"
                  value={form.club_name}
                  onChange={e => setForm({ ...form, club_name: e.target.value })}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Kategori</label>
                <select 
                  style={s.select}
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Spor">Spor</option>
                  <option value="Müzik">Müzik</option>
                  <option value="Teknoloji">Teknoloji</option>
                  <option value="Sanat">Sanat</option>
                  <option value="Bilim">Bilim</option>
                  <option value="Sosyal">Sosyal</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Açıklama (Opsiyonel)</label>
                <textarea
                  style={s.textarea}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Danışman Adı</label>
                <input
                  style={s.input}
                  type="text"
                  value={form.advisor_name}
                  onChange={e => setForm({ ...form, advisor_name: e.target.value })}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Danışman Fakültesi</label>
                <input
                  style={s.input}
                  type="text"
                  value={form.advisor_faculty}
                  onChange={e => setForm({ ...form, advisor_faculty: e.target.value })}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Danışman Mail</label>
                <input
                  style={s.input}
                  type="email"
                  value={form.advisor_email}
                  onChange={e => setForm({ ...form, advisor_email: e.target.value })}
                  required
                />
                <span style={s.note}>edu.tr uzantılı olmalıdır</span>
              </div>
              <div style={s.field}>
                <label style={s.label}>Logo URL (Opsiyonel)</label>
                <input
                  style={s.input}
                  type="url"
                  placeholder="https://..."
                  value={form.logo_url}
                  onChange={e => setForm({ ...form, logo_url: e.target.value })}
                />
              </div>
              
              <button style={s.btnPrimary} type="submit" disabled={loading || success}>
                Devam Et
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div style={s.field}>
                <label style={s.label}>Topluluk Başkanı Adı</label>
                <input
                  style={s.input}
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Topluluk Maili</label>
                <input
                  style={s.input}
                  type="email"
                  value={form.club_email}
                  onChange={e => setForm({ ...form, club_email: e.target.value })}
                  required
                />
                <span style={s.note}>edu.tr uzantılı olmalıdır</span>
              </div>
              <div style={s.field}>
                <label style={s.label}>Kişisel Mail</label>
                <input
                  style={s.input}
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
                <span style={s.note}>edu.tr uzantılı olmalıdır</span>
              </div>
              <div style={s.field}>
                <label style={s.label}>Telefon (Opsiyonel)</label>
                <input
                  style={s.input}
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Şifre</label>
                <input
                  style={s.input}
                  type="password"
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
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
              
              <button style={s.btnPrimary} type="submit" disabled={loading || success}>
                {loading ? 'Gönderiliyor…' : 'Başvuruyu Gönder'}
              </button>
              
              <button 
                type="button" 
                style={s.btnSecondary} 
                onClick={() => setStep(1)}
                disabled={loading || success}
              >
                Geri
              </button>
            </>
          )}
        </form>

        <div style={s.footer}>
          Zaten hesabınız var mı?{' '}
          <Link to="/login" style={s.link}>Giriş Yap</Link>
        </div>
      </div>
    </div>
  )
}
