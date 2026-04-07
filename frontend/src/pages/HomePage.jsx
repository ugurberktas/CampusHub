import { Link, useNavigate } from 'react-router-dom'
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
  navLink: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    transition: 'color var(--transition)',
  },
  navLinkActive: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--primary)',
    background: 'var(--primary-muted)',
  },
  logoutBtn: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    background: 'transparent',
    border: '1px solid var(--border)',
    cursor: 'pointer',
  },
  main: { flex: 1, padding: '48px 32px', maxWidth: '1100px', margin: '0 auto', width: '100%' },
  hero: { marginBottom: '48px' },
  heroGreet: { fontSize: '13px', color: 'var(--primary)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' },
  heroTitle: { fontSize: '36px', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '12px' },
  heroSub: { color: 'var(--text-secondary)', fontSize: '16px' },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '32px' },
  quickCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'border-color var(--transition), transform var(--transition)',
    cursor: 'pointer',
  },
  quickIcon: { fontSize: '28px' },
  quickLabel: { fontWeight: '600', fontSize: '15px' },
  quickSub: { color: 'var(--text-secondary)', fontSize: '13px' },
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLogo}>Campus Hub</div>
        <div style={s.navLinks}>
          <Link to="/" style={s.navLinkActive}>Ana Sayfa</Link>
          <Link to="/clubs" style={s.navLink}>Kulüpler</Link>
          <button style={s.logoutBtn} onClick={() => { logout(); navigate('/login') }}>
            Çıkış Yap
          </button>
        </div>
      </nav>
      <main style={s.main}>
        <div style={s.hero}>
          <div style={s.heroGreet}>Hoş geldiniz</div>
          <div style={s.heroTitle}>
            Merhaba, {user?.full_name || 'Öğrenci'} 👋
          </div>
          <div style={s.heroSub}>Campus Hub'a hoş geldiniz. Kulüpleri keşfedin, etkinliklere katılın.</div>
        </div>
        <div style={s.quickGrid}>
          {[
            { icon: '🏛️', label: 'Kulüpler', sub: 'Tüm kulüpleri keşfet', path: '/clubs' },
            { icon: '📅', label: 'Etkinlikler', sub: 'Yaklaşan etkinlikler', path: '/events' },
            { icon: '👤', label: 'Profilim', sub: 'Hesap ayarları', path: '/profile' },
          ].map(item => (
            <div
              key={item.label}
              style={s.quickCard}
              onClick={() => navigate(item.path)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={s.quickIcon}>{item.icon}</div>
              <div style={s.quickLabel}>{item.label}</div>
              <div style={s.quickSub}>{item.sub}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
