import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events')
        const allEvents = Array.isArray(res.data) ? res.data : []
        setEvents(allEvents.slice(0, 3))
      } catch (err) {
        console.error('Etkinlikler çekilirken hata:', err)
      } finally {
        setLoadingEvents(false)
      }
    }
    
    fetchEvents()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handlePlaceholderClick = (action) => {
    console.log(`${action} henüz aktif değil.`)
  }

  const s = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-surface)',
    },
    sidebar: {
      width: '280px',
      background: 'linear-gradient(180deg, #8B0000 0%, #5a0000 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      flexShrink: 0,
    },
    logoText: {
      fontSize: '28px',
      fontWeight: '800',
      letterSpacing: '-1px',
      marginBottom: '32px',
    },
    userInfoBox: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 'var(--radius-sm)',
      padding: '16px',
      marginBottom: '32px',
    },
    userName: {
      fontWeight: '600',
      fontSize: '16px',
      marginBottom: '4px',
    },
    userDetail: {
      fontSize: '12px',
      opacity: 0.8,
      lineHeight: '1.4',
    },
    navMenu: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      flex: 1,
    },
    navItem: {
      padding: '12px 16px',
      borderRadius: 'var(--radius-sm)',
      color: '#fff',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'background var(--transition)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logoutBtn: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      border: 'none',
      padding: '12px',
      borderRadius: 'var(--radius-sm)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background var(--transition)',
      marginTop: 'auto',
    },
    mainContent: {
      flex: 1,
      padding: '40px',
      overflowY: 'auto',
    },
    welcomeSection: {
      marginBottom: '40px',
    },
    welcomeTitle: {
      fontSize: '32px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      marginBottom: '8px',
    },
    welcomeSubtitle: {
      fontSize: '16px',
      color: 'var(--text-secondary)',
    },
    gridSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '40px',
    },
    actionCard: {
      background: 'var(--bg-card)',
      padding: '24px',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-card)',
      cursor: 'pointer',
      transition: 'transform var(--transition), box-shadow var(--transition)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      textDecoration: 'none',
      color: 'var(--text-primary)',
    },
    actionIcon: {
      fontSize: '32px',
      marginBottom: '16px',
    },
    actionTitle: {
      fontSize: '18px',
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      marginBottom: '16px',
      borderBottom: '2px solid var(--primary-muted)',
      paddingBottom: '8px',
      display: 'inline-block'
    },
    cardList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '40px',
    },
    eventCard: {
      background: 'var(--bg-card)',
      padding: '20px',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    eventTitle: {
      fontWeight: '600',
      fontSize: '16px',
      marginBottom: '4px',
      color: 'var(--text-primary)'
    },
    eventDetail: {
      fontSize: '14px',
      color: 'var(--text-secondary)',
    },
    eventDateBox: {
      background: 'var(--primary-muted)',
      color: 'var(--primary)',
      padding: '8px 12px',
      borderRadius: 'var(--radius-sm)',
      fontWeight: '600',
      fontSize: '14px',
      textAlign: 'center',
    },
    emptyState: {
      background: 'var(--bg-card)',
      padding: '32px',
      borderRadius: 'var(--radius-sm)',
      textAlign: 'center',
      color: 'var(--text-muted)',
      border: '1px dashed var(--border)',
      marginBottom: '40px',
    }
  }

  const formatUserDetails = () => {
    if (!user) return ''
    const parts = []
    if (user.university) parts.push(user.university)
    if (user.department) parts.push(user.department)
    if (user.grade) parts.push(user.grade)
    return parts.join(' • ')
  }

  const userDetails = formatUserDetails()

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div style={s.container}>
      {/* --- SIDEBAR --- */}
      <div style={s.sidebar}>
        <div style={s.logoText}>Campus Hub</div>
        
        <div style={s.userInfoBox}>
          <div style={s.userName}>{user?.full_name || user?.email?.split('@')[0] || 'Öğrenci'}</div>
          {userDetails && <div style={s.userDetail}>{userDetails}</div>}
        </div>

        <div style={s.navMenu}>
          <Link 
            to="/clubs" 
            style={s.navItem} 
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'} 
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>🏛️</span> Kulüpler
          </Link>
          <Link 
            to="/events" 
            style={s.navItem} 
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'} 
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>📅</span> Etkinlikler
          </Link>
          <div 
            style={s.navItem} 
            onClick={() => handlePlaceholderClick('Başvurularım')} 
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'} 
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>📝</span> Başvurularım
          </div>
          <div 
            style={s.navItem} 
            onClick={() => handlePlaceholderClick('Profilim')} 
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'} 
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>👤</span> Profilim
          </div>
        </div>

        <button 
          style={s.logoutBtn} 
          onClick={handleLogout}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          Çıkış Yap
        </button>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div style={s.mainContent}>
        
        <div style={s.welcomeSection}>
          <h1 style={s.welcomeTitle}>Merhaba, {user?.full_name || user?.email?.split('@')[0]}</h1>
          {userDetails && <div style={s.welcomeSubtitle}>{userDetails}</div>}
        </div>

        {/* Hızlı Aksiyonlar */}
        <div style={s.gridSection}>
          <Link 
            to="/clubs" 
            style={s.actionCard} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} 
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={s.actionIcon}>🏛️</div>
            <div style={s.actionTitle}>Kulüpleri Keşfet</div>
          </Link>
          <Link 
            to="/events" 
            style={s.actionCard} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} 
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={s.actionIcon}>📅</div>
            <div style={s.actionTitle}>Etkinlikleri Gör</div>
          </Link>
          <div 
            style={s.actionCard} 
            onClick={() => handlePlaceholderClick('Başvurularım')} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} 
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={s.actionIcon}>📝</div>
            <div style={s.actionTitle}>Başvurularım</div>
          </div>
          <div 
            style={s.actionCard} 
            onClick={() => handlePlaceholderClick('Profilim')} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} 
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={s.actionIcon}>👤</div>
            <div style={s.actionTitle}>Profilim</div>
          </div>
        </div>

        {/* Yaklaşan Etkinlikler */}
        <h2 style={s.sectionTitle}>Yaklaşan Etkinlikler</h2>
        <div style={s.cardList}>
          {loadingEvents ? (
            <div style={s.emptyState}>Etkinlikler yükleniyor...</div>
          ) : events.length > 0 ? (
            events.map((ev) => (
              <div key={ev.id} style={s.eventCard}>
                <div>
                  <div style={s.eventTitle}>{ev.title}</div>
                  <div style={s.eventDetail}>
                    📍 {ev.location || 'Konum belirtilmedi'}
                  </div>
                </div>
                <div style={s.eventDateBox}>
                  {formatDate(ev.event_date)}
                </div>
              </div>
            ))
          ) : (
            <div style={s.emptyState}>Henüz yaklaşan etkinlik bulunmuyor.</div>
          )}
        </div>

        {/* Katıldığım Kulüpler */}
        <h2 style={s.sectionTitle}>Katıldığım Kulüpler</h2>
        <div style={s.emptyState}>Henüz katıldığın kulüp yok.</div>

        {/* Başvurularım */}
        <h2 style={s.sectionTitle}>Başvurularım</h2>
        <div style={s.emptyState}>Henüz aktif başvurun veya katılım kaydın bulunmuyor.</div>

      </div>
    </div>
  )
}
