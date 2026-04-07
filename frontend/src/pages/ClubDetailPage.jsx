import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },
  nav: {
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLogo: { fontSize: '20px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' },
  navLinks: { display: 'flex', gap: '8px', alignItems: 'center' },
  navLink: { padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' },
  logoutBtn: { padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer' },
  main: { flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 32px 60px' },
  // Banner
  banner: {
    width: '100%',
    height: '220px',
    background: 'linear-gradient(135deg, #1a0505 0%, #2d0808 40%, #1a0000 100%)',
    borderRadius: '0 0 16px 16px',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '0',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '24px',
  },
  bannerImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 },
  bannerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' },
  // Profile area
  profileRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '20px',
    marginTop: '-40px',
    padding: '0 4px',
    position: 'relative',
    zIndex: 10,
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  logoWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '16px',
    background: 'var(--bg-card)',
    border: '3px solid var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  profileInfo: { flex: 1, paddingBottom: '4px' },
  clubName: { fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: '6px' },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'var(--primary-muted)',
    border: '1px solid rgba(139,0,0,0.3)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#e05050',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  // Follow button
  followBtn: {
    padding: '12px 28px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s ease, transform 0.15s ease',
    letterSpacing: '0.2px',
    flexShrink: 0,
    alignSelf: 'center',
  },
  followedBtn: {
    padding: '12px 28px',
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'default',
    flexShrink: 0,
    alignSelf: 'center',
  },
  // Stats strip
  statsRow: {
    display: 'flex',
    gap: '0',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    marginBottom: '28px',
  },
  statItem: {
    flex: 1,
    padding: '18px 24px',
    textAlign: 'center',
    borderRight: '1px solid var(--border)',
  },
  statVal: { fontSize: '22px', fontWeight: '800', color: 'var(--primary)' },
  statLbl: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' },
  // Description card
  descCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '28px',
    marginBottom: '24px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-primary)' },
  descText: { color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.75' },
  // Back link
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: '500',
    margin: '20px 0 0',
    padding: '6px 0',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
  // States
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '16px', minHeight: '300px' },
  spinner: { width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: 'var(--text-secondary)', fontSize: '14px' },
  errorBox: { background: 'rgba(139,0,0,0.12)', border: '1px solid rgba(139,0,0,0.3)', borderRadius: 'var(--radius)', padding: '24px', textAlign: 'center', color: '#ff7070', fontSize: '14px', maxWidth: '400px' },
  retryBtn: { marginTop: '12px', padding: '10px 24px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  successToast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: 'rgba(0,160,80,0.15)',
    border: '1px solid rgba(0,160,80,0.35)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 20px',
    color: '#4ade80',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 9999,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  errorToast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: 'rgba(139,0,0,0.15)',
    border: '1px solid rgba(139,0,0,0.3)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 20px',
    color: '#ff7070',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 9999,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
}

export default function ClubDetailPage() {
  const { id } = useParams()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isMember, setIsMember] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success'|'error', message }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchClub = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/clubs/${id}`)
      setClub(res.data)

      // Check membership: look for current user in member list
      if (user) {
        try {
          const membersRes = await api.get(`/clubs/${id}/members`)
          const members = membersRes.data
          const found = members.some(m => m.user_id === user.id || m.id === user.id)
          setIsMember(found)
        } catch {
          // Endpoint may be protected or unavailable — default to not member
          setIsMember(false)
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Kulüp bilgileri yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!document.getElementById('ch-spin')) {
      const style = document.createElement('style')
      style.id = 'ch-spin'
      style.textContent = '@keyframes spin { to { transform: rotate(360deg) } }'
      document.head.appendChild(style)
    }
    fetchClub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleFollow = async () => {
    if (isMember || followLoading) return
    setFollowLoading(true)
    try {
      await api.post(`/clubs/${id}/members`, { role: 'follower' })
      setIsMember(true)
      setClub(prev => prev ? { ...prev, member_count: (prev.member_count || 0) + 1 } : prev)
      showToast('success', '✅ Kulübü başarıyla takip ediyorsunuz!')
    } catch (err) {
      const msg = err.response?.data?.detail
      if (msg?.toLowerCase().includes('already') || msg?.toLowerCase().includes('zaten')) {
        setIsMember(true)
        showToast('success', 'Zaten bu kulübün üyesisiniz.')
      } else {
        showToast('error', msg || 'Takip işlemi sırasında bir hata oluştu.')
      }
    } finally {
      setFollowLoading(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Navbar */}
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

      {/* Loading state */}
      {loading && (
        <div style={s.center}>
          <div style={s.spinner} />
          <p style={s.loadingText}>Kulüp bilgileri yükleniyor…</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={s.center}>
          <div style={s.errorBox}>
            ⚠️ {error}
            <br />
            <button style={s.retryBtn} onClick={fetchClub}>Tekrar Dene</button>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && club && (
        <main style={s.main}>
          {/* Banner */}
          <div style={s.banner}>
            {club.banner_url && (
              <img src={club.banner_url} alt={`${club.name} banner`} style={s.bannerImg} />
            )}
            <div style={s.bannerOverlay} />
          </div>

          {/* Back link */}
          <button style={s.backLink} onClick={() => navigate('/clubs')}>
            ← Kulüplere Geri Dön
          </button>

          {/* Profile row (logo + name + follow btn) */}
          <div style={s.profileRow}>
            <div style={s.logoWrap}>
              {club.logo_url
                ? <img src={club.logo_url} alt={`${club.name} logosu`} style={s.logoImg} />
                : <span>🏛️</span>}
            </div>
            <div style={s.profileInfo}>
              <h1 style={s.clubName}>{club.name}</h1>
              {club.category && <span style={s.categoryBadge}>{club.category}</span>}
            </div>
            {isMember ? (
              <button style={s.followedBtn} disabled aria-label="Takip ediliyor">
                ✓ Takip Ediliyor
              </button>
            ) : (
              <button
                style={s.followBtn}
                onClick={handleFollow}
                disabled={followLoading}
                aria-label={`${club.name} kulübünü takip et`}
                onMouseEnter={e => { if (!followLoading) e.currentTarget.style.background = 'var(--primary-light)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)' }}
              >
                {followLoading ? 'İşleniyor…' : '+ Takip Et'}
              </button>
            )}
          </div>

          {/* Stats strip */}
          <div style={s.statsRow}>
            <div style={s.statItem}>
              <div style={s.statVal}>{club.member_count ?? 0}</div>
              <div style={s.statLbl}>Üye</div>
            </div>
            <div style={{ ...s.statItem, borderRight: 'none' }}>
              <div style={s.statVal}>{club.category || '—'}</div>
              <div style={s.statLbl}>Kategori</div>
            </div>
          </div>

          {/* Description */}
          <div style={s.descCard}>
            <h2 style={s.sectionTitle}>Kulüp Hakkında</h2>
            <p style={s.descText}>
              {club.description || 'Bu kulüp için henüz bir açıklama eklenmemiş.'}
            </p>
          </div>
        </main>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={toast.type === 'success' ? s.successToast : s.errorToast}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
