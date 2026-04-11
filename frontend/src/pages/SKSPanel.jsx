import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function SKSPanel() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('home')
  
  const [stats, setStats] = useState({ pendingCount: 0, approvedCount: 0, eventCount: 0 })
  const [pendingClubs, setPendingClubs] = useState([])
  const [approvedClubs, setApprovedClubs] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  
  const [toast, setToast] = useState(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowWidth < 768

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (!user || user.role !== 'sks_staff') return
    
    const fetchDashboardStats = async () => {
      try {
        const [pendingRes, approvedRes, eventsRes] = await Promise.all([
          api.get('/clubs/pending'),
          api.get('/clubs?status=approved').catch(() => api.get('/clubs')), // Fallback if query unsupported
          api.get('/events')
        ])
        
        let approvedCount = 0
        if (approvedRes.data && Array.isArray(approvedRes.data)) {
          approvedCount = approvedRes.data.filter(c => c.status === 'approved').length
        }
        
        setStats({
          pendingCount: pendingRes.data?.length || 0,
          approvedCount: approvedCount,
          eventCount: eventsRes.data?.length || 0
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }
    
    if (activeTab === 'home') fetchDashboardStats()
    else if (activeTab === 'pending') fetchPendingClubs()
    else if (activeTab === 'approved') fetchApprovedClubs()
  }, [activeTab, user])

  const fetchPendingClubs = async () => {
    setDataLoading(true)
    try {
      const res = await api.get('/clubs/pending')
      setPendingClubs(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setDataLoading(false)
    }
  }

  const fetchApprovedClubs = async () => {
    setDataLoading(true)
    try {
      let res = await api.get('/clubs?status=approved').catch(() => api.get('/clubs'))
      const clubs = res.data || []
      // Defensive fallback filtering
      setApprovedClubs(clubs.filter(c => c.status === 'approved'))
    } catch (err) {
      console.error(err)
    } finally {
      setDataLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await api.put(`/clubs/${id}/approve`)
      setPendingClubs(prev => prev.filter(c => c.id !== id))
      showToast('Topluluk başarıyla onaylandı!')
    } catch (err) {
      console.error(err)
      showToast('İşlem başarısız oldu.')
    }
  }

  const handleReject = async (id) => {
    try {
      await api.put(`/clubs/${id}/reject`)
      setPendingClubs(prev => prev.filter(c => c.id !== id))
      showToast('Topluluk reddedildi.')
    } catch (err) {
      console.error(err)
      showToast('İşlem başarısız oldu.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>Yükleniyor...</div>
  }

  if (!user || user.role !== 'sks_staff') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>⛔ Bu sayfaya erişim yetkiniz yok</div>
      </div>
    )
  }

  const s = {
    layout: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      background: 'var(--bg-surface)',
    },
    sidebar: {
      width: isMobile ? '100%' : '260px',
      background: '#8B0000',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      padding: '24px 16px',
    },
    logo: {
      fontSize: '24px',
      fontWeight: '800',
      marginBottom: isMobile ? '16px' : '40px',
      textAlign: isMobile ? 'center' : 'left',
    },
    navMenu: {
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      gap: '8px',
      overflowX: isMobile ? 'auto' : 'visible',
      paddingBottom: isMobile ? '8px' : '0',
    },
    navItem: (isActive) => ({
      padding: '12px 16px',
      borderRadius: 'var(--radius-sm)',
      background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background var(--transition)',
      whiteSpace: isMobile ? 'nowrap' : 'normal',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }),
    logoutBtn: {
      marginTop: isMobile ? '0' : 'auto',
      padding: '12px 16px',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.1)',
      fontWeight: '600'
    },
    main: {
      flex: 1,
      padding: isMobile ? '16px' : '40px',
      overflowY: 'auto'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '24px',
      color: 'var(--text-primary)'
    },
    statGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'white',
      border: '1px solid var(--border)',
      borderLeft: '4px solid #8B0000',
      borderRadius: 'var(--radius-sm)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)'
    },
    statNumber: {
      fontSize: '36px',
      fontWeight: '800',
      color: 'var(--text-primary)',
      lineHeight: '1'
    },
    statLabel: {
      fontSize: '14px',
      color: 'var(--text-secondary)',
      marginTop: '8px',
      fontWeight: '500'
    },
    toast: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: '#333',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontWeight: '500',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease forwards'
    },
    cardList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    clubCard: {
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: '20px'
    },
    clubInfo: {
      flex: 1
    },
    clubName: {
      fontSize: '18px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      marginBottom: '4px'
    },
    clubCategory: {
      display: 'inline-block',
      background: 'var(--bg-surface)',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
      color: 'var(--text-secondary)',
      marginBottom: '8px'
    },
    clubDesc: {
      fontSize: '14px',
      color: 'var(--text-secondary)',
      lineHeight: '1.5'
    },
    clubDate: {
      fontSize: '12px',
      color: 'var(--text-muted)',
      marginTop: '8px'
    },
    actionGroup: {
      display: 'flex',
      gap: '12px',
      width: isMobile ? '100%' : 'auto'
    },
    btnApprove: {
      padding: '10px 20px',
      background: '#2e7d32',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      fontWeight: '600',
      cursor: 'pointer',
      flex: isMobile ? 1 : 'none'
    },
    btnReject: {
      padding: '10px 20px',
      background: '#d32f2f',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      fontWeight: '600',
      cursor: 'pointer',
      flex: isMobile ? 1 : 'none'
    },
    table: {
      width: '100%',
      background: 'white',
      borderCollapse: 'collapse',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    },
    th: {
      background: 'var(--bg-surface)',
      padding: '16px',
      textAlign: 'left',
      fontSize: '13px',
      fontWeight: '600',
      color: 'var(--text-secondary)',
      borderBottom: '1px solid var(--border)'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid var(--border)',
      fontSize: '14px',
      color: 'var(--text-primary)'
    },
    emptyState: {
      padding: '40px',
      textAlign: 'center',
      color: 'var(--text-secondary)',
      background: 'white',
      borderRadius: 'var(--radius-sm)',
      border: '1px dashed var(--border)'
    }
  }

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <div>
          <h2 style={s.title}>Genel Bakış</h2>
          <div style={s.statGrid}>
            <div style={s.statCard}>
              <div style={s.statNumber}>{stats.pendingCount}</div>
              <div style={s.statLabel}>Bekleyen Başvurular</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statNumber}>{stats.approvedCount}</div>
              <div style={s.statLabel}>Onaylanan Topluluklar</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statNumber}>{stats.eventCount}</div>
              <div style={s.statLabel}>Toplam Etkinlik</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statNumber}>--</div>
              <div style={s.statLabel}>Toplam Kullanıcı</div>
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === 'pending') {
      return (
        <div>
          <h2 style={s.title}>Topluluk Başvuruları</h2>
          {dataLoading ? (
            <div>Yükleniyor...</div>
          ) : pendingClubs.length === 0 ? (
            <div style={s.emptyState}>Bekleyen başvuru bulunmuyor 🎉</div>
          ) : (
            <div style={s.cardList}>
              {pendingClubs.map(club => (
                <div key={club.id} style={s.clubCard}>
                  <div style={s.clubInfo}>
                    <div style={s.clubName}>{club.name}</div>
                    <div style={s.clubCategory}>{club.category}</div>
                    <div style={s.clubDesc}>{club.description || 'Açıklama belirtilmemiş.'}</div>
                    <div style={s.clubDate}>Oluşturulma: {new Date(club.created_at).toLocaleDateString('tr-TR')}</div>
                  </div>
                  <div style={s.actionGroup}>
                    <button style={s.btnApprove} onClick={() => handleApprove(club.id)}>Onayla</button>
                    <button style={s.btnReject} onClick={() => handleReject(club.id)}>Reddet</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'approved') {
      return (
        <div>
          <h2 style={s.title}>Onaylanan Topluluklar</h2>
          {dataLoading ? (
            <div>Yükleniyor...</div>
          ) : approvedClubs.length === 0 ? (
            <div style={s.emptyState}>Henüz onaylanmış bir topluluk bulunmuyor.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Kulüp Adı</th>
                    <th style={s.th}>Kategori</th>
                    <th style={s.th}>Üniversite Onayı</th>
                    <th style={s.th}>Oluşturulma Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedClubs.map(club => (
                    <tr key={club.id}>
                      <td style={{ ...s.td, fontWeight: '600' }}>{club.name}</td>
                      <td style={s.td}><span style={s.clubCategory}>{club.category}</span></td>
                      <td style={s.td}>✅ Onaylı</td>
                      <td style={s.td}>{new Date(club.created_at).toLocaleDateString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )
    }

    return (
      <div style={s.emptyState}>Bu sayfa henüz yapım aşamasındadır.</div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={s.layout}>
        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={s.logo}>Campus Hub</div>
          <div style={s.navMenu}>
            <div style={s.navItem(activeTab === 'home')} onClick={() => setActiveTab('home')}>
              <span>🏠</span> Ana Sayfa
            </div>
            <div style={s.navItem(activeTab === 'pending')} onClick={() => setActiveTab('pending')}>
              <span>🏛️</span> Topluluk Başvuruları
            </div>
            <div style={s.navItem(activeTab === 'approved')} onClick={() => setActiveTab('approved')}>
              <span>✅</span> Onaylanan Topluluklar
            </div>
            <div style={s.navItem(activeTab === 'rejected')} onClick={() => setActiveTab('rejected')}>
              <span>❌</span> Reddedilen Topluluklar
            </div>
            <div style={s.navItem(activeTab === 'events')} onClick={() => setActiveTab('events')}>
              <span>📅</span> Etkinlikler
            </div>
            <div style={s.navItem(activeTab === 'users')} onClick={() => setActiveTab('users')}>
              <span>👥</span> Kullanıcılar
            </div>
            {isMobile && (
              <div style={{ ...s.navItem(false), border: '1px solid rgba(255,255,255,0.2)' }} onClick={handleLogout}>
                🚪 Çıkış Yap
              </div>
            )}
          </div>
          {!isMobile && (
            <div style={s.logoutBtn} onClick={handleLogout}>
              Çıkış Yap
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={s.main}>
          {renderContent()}
        </div>

        {toast && <div style={s.toast}>{toast}</div>}
      </div>
    </>
  )
}
