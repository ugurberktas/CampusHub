import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import ClubCard from '../components/ClubCard'

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
  navLinkActive: { padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600', color: 'var(--primary)', background: 'var(--primary-muted)' },
  logoutBtn: { padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer' },
  main: { flex: 1, padding: '40px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%' },
  pageHeader: { marginBottom: '32px' },
  pageTitle: { fontSize: '30px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '6px' },
  pageSubTitle: { color: 'var(--text-secondary)', fontSize: '15px' },
  controls: { display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { position: 'relative', flex: 1, minWidth: '240px' },
  searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' },
  searchInput: {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px 12px 42px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  filterRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  filterBtnActive: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    background: 'var(--primary-muted)',
    border: '1px solid rgba(139,0,0,0.4)',
    color: '#e05050',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  countLabel: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '16px', minHeight: '300px' },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--border)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { color: 'var(--text-secondary)', fontSize: '14px' },
  errorBox: {
    background: 'rgba(139,0,0,0.12)',
    border: '1px solid rgba(139,0,0,0.3)',
    borderRadius: 'var(--radius)',
    padding: '24px',
    textAlign: 'center',
    color: '#ff7070',
    fontSize: '14px',
    maxWidth: '400px',
  },
  retryBtn: {
    marginTop: '12px',
    padding: '10px 24px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  emptyBox: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '42px' },
  emptyText: { color: 'var(--text-secondary)', fontSize: '14px' },
}

export default function ClubsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tümü')

  const fetchClubs = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/clubs')
      setClubs(res.data)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClubs()
    // Inject spinner animation once
    if (!document.getElementById('ch-spin')) {
      const style = document.createElement('style')
      style.id = 'ch-spin'
      style.textContent = '@keyframes spin { to { transform: rotate(360deg) } }'
      document.head.appendChild(style)
    }
  }, [])

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = clubs.map(c => c.category).filter(Boolean)
    return ['Tümü', ...Array.from(new Set(cats))]
  }, [clubs])

  // Filter clubs by search + category
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clubs.filter(club => {
      const matchSearch = !q
        || club.name?.toLowerCase().includes(q)
        || club.category?.toLowerCase().includes(q)
        || club.description?.toLowerCase().includes(q)
      const matchCategory = activeCategory === 'Tümü' || club.category === activeCategory
      return matchSearch && matchCategory
    })
  }, [clubs, search, activeCategory])

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navLogo}>Campus Hub</div>
        <div style={s.navLinks}>
          <Link to="/" style={s.navLink}>Ana Sayfa</Link>
          <Link to="/clubs" style={s.navLinkActive}>Kulüpler</Link>
          <button style={s.logoutBtn} onClick={() => { logout(); navigate('/login') }}>
            Çıkış Yap
          </button>
        </div>
      </nav>

      <main style={s.main}>
        {/* Page header */}
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>Kulüpler</h1>
          <p style={s.pageSubTitle}>Kampüsündeki tüm kulüpleri keşfet ve takip et</p>
        </div>

        {/* Controls */}
        {!loading && !error && (
          <div style={{ marginBottom: '24px' }}>
            <div style={s.controls}>
              <div style={s.searchWrap}>
                <span style={s.searchIcon}>🔍</span>
                <input
                  id="clubs-search"
                  style={s.searchInput}
                  type="text"
                  placeholder="Kulüp adı veya kategori ara…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'rgba(139,0,0,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Category filters */}
            <div style={s.filterRow}>
              {categories.map(cat => (
                <button
                  key={cat}
                  style={activeCategory === cat ? s.filterBtnActive : s.filterBtn}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* States */}
        {loading && (
          <div style={s.center}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Kulüpler yükleniyor…</p>
          </div>
        )}

        {error && !loading && (
          <div style={s.center}>
            <div style={s.errorBox}>
              ⚠️ {error}
              <br />
              <button style={s.retryBtn} onClick={fetchClubs}>
                Tekrar Dene
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <p style={s.countLabel}>{filtered.length} kulüp listeleniyor</p>

            {filtered.length === 0 ? (
              <div style={s.center}>
                <div style={s.emptyBox}>🔍</div>
                <p style={s.emptyText}>
                  {search ? `"${search}" için sonuç bulunamadı.` : 'Henüz aktif kulüp bulunmuyor.'}
                </p>
              </div>
            ) : (
              <div style={s.grid}>
                {filtered.map(club => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
