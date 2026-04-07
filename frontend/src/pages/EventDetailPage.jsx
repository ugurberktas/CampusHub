import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

/* ─── Inline styles ──────────────────────────────────────────── */
const s = {
  page: { minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' },

  /* Navbar */
  nav: {
    background: '#ffffff',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  navLogo: { fontSize: '20px', fontWeight: '800', color: '#8B0000', letterSpacing: '-0.5px' },
  navLinks: { display: 'flex', gap: '8px', alignItems: 'center' },
  navLink: { padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#555566' },
  logoutBtn: {
    padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
    color: '#555566', background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer',
  },

  /* Layout */
  main: { flex: 1, maxWidth: '780px', margin: '0 auto', width: '100%', padding: '32px 24px 64px' },

  /* Back button */
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#888899', fontSize: '13px', fontWeight: '500', padding: '0 0 20px',
  },

  /* Hero banner area */
  heroBanner: {
    background: 'linear-gradient(135deg, #4a0000 0%, #8B0000 60%, #b30000 100%)',
    borderRadius: '16px',
    padding: '40px 36px',
    marginBottom: '28px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBannerAccent: {
    position: 'absolute', top: '-40px', right: '-40px',
    width: '220px', height: '220px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '50%',
  },
  heroCategory: {
    display: 'inline-block', padding: '4px 12px',
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px', fontSize: '11px', fontWeight: '700',
    color: 'rgba(255,255,255,0.9)', letterSpacing: '1px', textTransform: 'uppercase',
    marginBottom: '14px',
  },
  heroTitle: {
    fontSize: '28px', fontWeight: '800', color: '#ffffff',
    letterSpacing: '-0.5px', lineHeight: 1.25, marginBottom: '10px',
    position: 'relative', zIndex: 1,
  },
  heroClub: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500', position: 'relative', zIndex: 1 },

  /* Content card */
  card: {
    background: '#ffffff', border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: '16px', padding: '28px', marginBottom: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  sectionTitle: { fontSize: '13px', fontWeight: '700', color: '#8B0000', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '16px' },

  /* Info grid */
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  infoItem: {
    background: '#f9f9fb', border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: '10px', padding: '14px 16px',
  },
  infoLabel: { fontSize: '11px', fontWeight: '600', color: '#888899', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' },
  infoValue: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a' },

  /* Description */
  descText: { fontSize: '14px', color: '#555566', lineHeight: 1.75 },

  /* Status badge */
  statusBadge: (status) => ({
    display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '700', letterSpacing: '0.3px',
    ...(status === 'active' || status === 'aktif'
      ? { background: 'rgba(0,160,80,0.1)', color: '#007a40', border: '1px solid rgba(0,160,80,0.25)' }
      : status === 'cancelled' || status === 'iptal'
        ? { background: 'rgba(139,0,0,0.1)', color: '#8B0000', border: '1px solid rgba(139,0,0,0.25)' }
        : { background: 'rgba(0,0,0,0.06)', color: '#555566', border: '1px solid rgba(0,0,0,0.1)' }),
  }),

  /* Register button */
  registerBtn: {
    width: '100%', padding: '16px', background: '#8B0000', color: '#ffffff',
    border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700',
    cursor: 'pointer', letterSpacing: '0.2px',
    transition: 'background 0.2s ease, transform 0.15s ease',
  },
  registeredBtn: {
    width: '100%', padding: '16px', background: '#f5f5f7', color: '#888899',
    border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', fontSize: '15px',
    fontWeight: '600', cursor: 'default',
  },
  loadingBtn: {
    width: '100%', padding: '16px', background: '#c04040', color: '#ffffff',
    border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'not-allowed',
  },

  /* States */
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '16px', minHeight: '300px' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e0e0e0', borderTop: '3px solid #8B0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#888899', fontSize: '14px' },
  errorBox: {
    background: 'rgba(139,0,0,0.06)', border: '1px solid rgba(139,0,0,0.2)',
    borderRadius: '14px', padding: '28px 32px', textAlign: 'center', color: '#8B0000', fontSize: '14px', maxWidth: '400px',
  },
  retryBtn: { marginTop: '14px', padding: '10px 24px', background: '#8B0000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },

  /* Toast */
  toast: (type) => ({
    position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
    borderRadius: '10px', padding: '13px 22px', fontSize: '14px', fontWeight: '600',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    ...(type === 'success'
      ? { background: 'rgba(0,160,80,0.1)', border: '1px solid rgba(0,160,80,0.3)', color: '#007a40' }
      : { background: 'rgba(139,0,0,0.1)', border: '1px solid rgba(139,0,0,0.3)', color: '#8B0000' }),
  }),

  /* Capacity bar */
  capacityBar: { height: '6px', borderRadius: '3px', background: '#f0f0f0', overflow: 'hidden', marginTop: '8px' },
  capacityFill: (pct) => ({
    height: '100%', borderRadius: '3px',
    width: `${Math.min(pct, 100)}%`,
    background: pct >= 90 ? '#8B0000' : pct >= 70 ? '#d97706' : '#16a34a',
    transition: 'width 0.4s ease',
  }),
}

/* ─── Helpers ────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function translateStatus(status) {
  const map = { active: 'Aktif', cancelled: 'İptal', completed: 'Tamamlandı', draft: 'Taslak' }
  return map[status] || status || '—'
}

/* ─── Component ──────────────────────────────────────────────── */
export default function EventDetailPage() {
  const { id } = useParams()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isRegistered, setIsRegistered] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [toast, setToast] = useState(null) // { type, message }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3200)
  }

  const fetchEvent = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/events/${id}`)
      setEvent(res.data)

      // Check if current user is already registered
      if (user) {
        try {
          const regRes = await api.get(`/events/${id}/registrations`)
          const regs = regRes.data
          const found = regs.some(
            r => r.user_id === user.id || r.id === user.id || r.user?.id === user.id
          )
          setIsRegistered(found)
        } catch {
          setIsRegistered(false)
        }
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Inject spinner keyframes once
    if (!document.getElementById('ch-spin')) {
      const style = document.createElement('style')
      style.id = 'ch-spin'
      style.textContent = '@keyframes spin { to { transform: rotate(360deg) } }'
      document.head.appendChild(style)
    }
    fetchEvent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleRegister = async () => {
    if (isRegistered || regLoading) return
    setRegLoading(true)
    try {
      await api.post(`/events/${id}/register`)
      setIsRegistered(true)
      setEvent(prev =>
        prev ? { ...prev, registered_count: (prev.registered_count || 0) + 1 } : prev
      )
      showToast('success', '✅ Etkinliğe başarıyla kayıt oldunuz!')
    } catch (err) {
      const detail = err.response?.data?.detail || ''
      if (detail.toLowerCase().includes('already') || detail.toLowerCase().includes('zaten')) {
        setIsRegistered(true)
        showToast('success', 'Bu etkinliğe zaten kayıtlısınız.')
      } else if (detail.toLowerCase().includes('kapasite') || detail.toLowerCase().includes('full') || detail.toLowerCase().includes('capacity')) {
        showToast('error', '⚠️ Etkinlik kapasitesi dolmuş, kayıt yapılamıyor.')
      } else {
        showToast('error', detail || 'Kayıt işlemi sırasında bir hata oluştu.')
      }
    } finally {
      setRegLoading(false)
    }
  }

  // Capacity percentage
  const capacityPct = event?.capacity
    ? Math.round(((event.registered_count || 0) / event.capacity) * 100)
    : 0

  return (
    <div style={s.page}>
      {/* ── Navbar ── */}
      <nav style={s.nav}>
        <div style={s.navLogo}>Campus Hub</div>
        <div style={s.navLinks}>
          <Link to="/" style={s.navLink}>Ana Sayfa</Link>
          <Link to="/clubs" style={s.navLink}>Kulüpler</Link>
          <button style={s.logoutBtn} onClick={() => { logout(); navigate('/login') }}>
            Çıkış Yap
          </button>
        </div>
      </nav>

      {/* ── Loading ── */}
      {loading && (
        <div style={s.center}>
          <div style={s.spinner} />
          <p style={s.loadingText}>Etkinlik bilgileri yükleniyor…</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div style={s.center}>
          <div style={s.errorBox}>
            ⚠️ {error}
            <br />
            <button style={s.retryBtn} onClick={fetchEvent}>Tekrar Dene</button>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {!loading && !error && event && (
        <main style={s.main}>
          {/* Back */}
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            ← Geri Dön
          </button>

          {/* Hero */}
          <div style={s.heroBanner}>
            <div style={s.heroBannerAccent} />
            {event.category && <div style={s.heroCategory}>{event.category}</div>}
            <h1 style={s.heroTitle}>{event.title}</h1>
            {event.club_name && (
              <div style={s.heroClub}>📍 {event.club_name} tarafından düzenleniyor</div>
            )}
          </div>

          {/* Info grid */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Etkinlik Bilgileri</div>
            <div style={s.infoGrid}>
              <div style={s.infoItem}>
                <div style={s.infoLabel}>📅 Tarih &amp; Saat</div>
                <div style={s.infoValue}>{formatDate(event.start_date || event.date)}</div>
              </div>
              <div style={s.infoItem}>
                <div style={s.infoLabel}>📍 Konum</div>
                <div style={s.infoValue}>{event.location || '—'}</div>
              </div>
              <div style={s.infoItem}>
                <div style={s.infoLabel}>🔖 Durum</div>
                <div style={s.infoValue}>
                  <span style={s.statusBadge(event.status)}>{translateStatus(event.status)}</span>
                </div>
              </div>
              <div style={s.infoItem}>
                <div style={s.infoLabel}>👥 Kapasite</div>
                <div style={s.infoValue}>
                  {event.capacity
                    ? `${event.registered_count ?? 0} / ${event.capacity} kişi`
                    : 'Sınırsız'}
                </div>
                {event.capacity > 0 && (
                  <div style={s.capacityBar}>
                    <div style={s.capacityFill(capacityPct)} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div style={s.card}>
              <div style={s.sectionTitle}>Açıklama</div>
              <p style={s.descText}>{event.description}</p>
            </div>
          )}

          {/* Register action */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Katılım</div>
            {isRegistered ? (
              <button style={s.registeredBtn} disabled aria-label="Kayıt olundu">
                ✓ Kayıt Olundu
              </button>
            ) : regLoading ? (
              <button style={s.loadingBtn} disabled>
                İşleniyor…
              </button>
            ) : (
              <button
                id="event-register-btn"
                style={s.registerBtn}
                onClick={handleRegister}
                aria-label={`${event.title} etkinliğine kayıt ol`}
                onMouseEnter={e => { e.currentTarget.style.background = '#a52020'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#8B0000'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Kayıt Ol
              </button>
            )}
            {event.capacity > 0 && capacityPct >= 90 && !isRegistered && (
              <p style={{ marginTop: '10px', fontSize: '12px', color: '#8B0000', fontWeight: '600', textAlign: 'center' }}>
                ⚠️ Kontenjanın %{capacityPct}'i doldu — hızlı ol!
              </p>
            )}
          </div>
        </main>
      )}

      {/* ── Toast ── */}
      {toast && <div style={s.toast(toast.type)}>{toast.message}</div>}
    </div>
  )
}
