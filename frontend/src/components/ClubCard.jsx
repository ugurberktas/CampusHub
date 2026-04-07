import { useNavigate } from 'react-router-dom'

/**
 * ClubCard – Reusable kulüp kartı bileşeni
 * Props: club { id, name, category, logo_url, description, member_count }
 */
export default function ClubCard({ club }) {
  const navigate = useNavigate()

  const s = {
    card: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '0',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 100%)',
      padding: '24px 20px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      borderBottom: '1px solid var(--border)',
    },
    logoWrap: {
      width: '52px',
      height: '52px',
      borderRadius: '12px',
      background: 'var(--primary-muted)',
      border: '1px solid rgba(139,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0,
    },
    logoImg: { width: '100%', height: '100%', objectFit: 'cover' },
    logoFallback: { fontSize: '22px' },
    nameWrap: { flex: 1, minWidth: 0 },
    name: {
      fontSize: '15px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    category: {
      display: 'inline-block',
      marginTop: '6px',
      padding: '3px 10px',
      background: 'var(--primary-muted)',
      border: '1px solid rgba(139,0,0,0.25)',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      color: '#d44',
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
    },
    body: { padding: '16px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
    desc: {
      fontSize: '13px',
      color: 'var(--text-secondary)',
      lineHeight: '1.6',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      flex: 1,
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'auto',
      paddingTop: '12px',
      borderTop: '1px solid var(--border)',
    },
    members: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: 'var(--text-muted)',
      fontWeight: '500',
    },
    memberDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: 'var(--primary)',
    },
    detailBtn: {
      fontSize: '12px',
      fontWeight: '600',
      color: 'var(--primary)',
      background: 'var(--primary-muted)',
      border: 'none',
      borderRadius: '6px',
      padding: '5px 12px',
      cursor: 'pointer',
    },
  }

  const handleClick = () => navigate(`/clubs/${club.id}`)

  const handleMouseEnter = (e) => {
    e.currentTarget.style.borderColor = 'rgba(139,0,0,0.4)'
    e.currentTarget.style.transform = 'translateY(-3px)'
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'
  }
  const handleMouseLeave = (e) => {
    e.currentTarget.style.borderColor = 'var(--border)'
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div
      style={s.card}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      aria-label={`${club.name} kulübü detayına git`}
    >
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoWrap}>
          {club.logo_url ? (
            <img src={club.logo_url} alt={`${club.name} logosu`} style={s.logoImg} />
          ) : (
            <span style={s.logoFallback}>🏛️</span>
          )}
        </div>
        <div style={s.nameWrap}>
          <div style={s.name}>{club.name}</div>
          {club.category && <span style={s.category}>{club.category}</span>}
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>
        <p style={s.desc}>
          {club.description || 'Bu kulüp için henüz açıklama eklenmemiş.'}
        </p>
        <div style={s.footer}>
          <div style={s.members}>
            <span style={s.memberDot} />
            {club.member_count ?? 0} üye
          </div>
          <button style={s.detailBtn} onClick={e => { e.stopPropagation(); handleClick() }}>
            İncele →
          </button>
        </div>
      </div>
    </div>
  )
}
