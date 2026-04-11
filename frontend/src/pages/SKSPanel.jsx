import React, { useState, useEffect, useCallback } from 'react'
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
  const [users, setUsers] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClub, setSelectedClub] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [clubMemberCount, setClubMemberCount] = useState(0)

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

  const fetchDashboardStats = useCallback(async () => {
    try {
      const [pendingRes, approvedRes, eventsRes] = await Promise.all([
        api.get('/clubs/pending'),
        api.get('/clubs?status=active').catch(() => api.get('/clubs')), // Fallback if query unsupported
        api.get('/events')
      ])
      
      let approvedCount = 0
      if (approvedRes.data && Array.isArray(approvedRes.data)) {
        approvedCount = approvedRes.data.filter(c => c.status === 'active').length
      }
      
      setStats({
        pendingCount: pendingRes.data?.length || 0,
        approvedCount: approvedCount,
        eventCount: eventsRes.data?.length || 0
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [])

  const fetchPendingClubs = useCallback(async () => {
    setDataLoading(true)
    try {
      const res = await api.get('/clubs/pending')
      const clubs = res.data || []
      
      const clubsWithDetails = await Promise.all(
        clubs.map(async (club) => {
          try {
            const memRes = await api.get(`/clubs/${club.id}/members`)
            const members = memRes.data || []
            const owner = members.find(m => m.role === 'owner')
            
            return {
              ...club,
              owner_name: owner?.user?.full_name || owner?.full_name || 'Bilinmiyor',
              owner_email: owner?.user?.email || owner?.email || 'Bilinmiyor',
              owner_phone: owner?.user?.phone || owner?.phone || 'Belirtilmedi'
            }
          } catch (e) {
            return {
              ...club,
              owner_name: 'Bilinmiyor',
              owner_email: 'Bilinmiyor',
              owner_phone: 'Belirtilmedi'
            }
          }
        })
      )
      
      setPendingClubs(clubsWithDetails)
    } catch (err) {
      console.error(err)
    } finally {
      setDataLoading(false)
    }
  }, [])

  const fetchApprovedClubs = useCallback(async () => {
    setDataLoading(true)
    try {
      let res = await api.get('/clubs?status=active').catch(() => api.get('/clubs'))
      const clubs = res.data || []
      setApprovedClubs(clubs.filter(c => c.status === 'active'))
    } catch (err) {
      console.error(err)
    } finally {
      setDataLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setDataLoading(true)
    try {
      const res = await api.get('/auth/users')
      console.log('Users fetched:', res.data)
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'sks_staff') return
    
    // Temizle
    setSearchQuery('')
    setSelectedClub(null)
    
    if (activeTab === 'home') fetchDashboardStats()
    else if (activeTab === 'pending') fetchPendingClubs()
    else if (activeTab === 'approved') fetchApprovedClubs()
    else if (activeTab === 'users') fetchUsers()
  }, [activeTab, user, fetchDashboardStats, fetchPendingClubs, fetchApprovedClubs, fetchUsers])

  const handleApprove = async (id) => {
    try {
      await api.put(`/clubs/${id}/approve`)
      setPendingClubs(prev => prev.filter(c => c.id !== id))
      fetchApprovedClubs()
      fetchDashboardStats()
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
      fetchDashboardStats() // Refreshes the pendingCount directly
      showToast('Topluluk reddedildi.')
    } catch (err) {
      console.error(err)
      showToast('İşlem başarısız oldu.')
    }
  }

  const handleRowClick = async (club) => {
    const clubData = { ...club, owner_name: '-', owner_department: '-', owner_email: '-' }
    setSelectedClub(clubData)
    setModalLoading(true)
    try {
      const res = await api.get(`/clubs/${club.id}/members`)
      setClubMemberCount(res.data?.length || 0)
      const owner = res.data?.find(m => m.role === 'owner')
      setSelectedClub(prev => ({
        ...prev,
        owner_name: owner?.user?.full_name || owner?.full_name || '-',
        owner_email: owner?.user?.email || owner?.email || '-',
        owner_department: owner?.user?.department || owner?.department || '-'
      }))
    } catch (err) {
      setClubMemberCount(0)
    } finally {
      setModalLoading(false)
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
      overflowY: 'auto',
      position: 'relative'
    },
    headerRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      marginBottom: '24px',
      gap: '16px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      margin: 0
    },
    searchInput: {
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '8px 16px',
      width: isMobile ? '100%' : '250px',
      outline: 'none',
      fontSize: '14px',
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
    contactCard: {
      marginTop: '12px',
      padding: '12px',
      background: 'var(--bg-surface)',
      borderRadius: '6px',
      border: '1px solid var(--border)'
    },
    contactTitle: {
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '6px',
      color: 'var(--text-primary)'
    },
    contactLine: {
      fontSize: '13px',
      color: 'var(--text-secondary)',
      marginBottom: '2px'
    },
    clubDate: {
      fontSize: '12px',
      color: 'var(--text-muted)',
      marginTop: '12px'
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
      color: 'var(--text-primary)',
      cursor: 'pointer'
    },
    trHover: {
      transition: 'background 0.2s',
      ':hover': { background: '#fcfcfc' }
    },
    emptyState: {
      padding: '40px',
      textAlign: 'center',
      color: 'var(--text-secondary)',
      background: 'white',
      borderRadius: 'var(--radius-sm)',
      border: '1px dashed var(--border)'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '16px'
    },
    modalContent: {
      background: 'white',
      width: '100%',
      maxWidth: '500px',
      borderRadius: 'var(--radius)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
      overflow: 'hidden',
      animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex',
      flexDirection: 'column'
    },
    modalHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'var(--bg-surface)'
    },
    modalTitle: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '700',
      color: 'var(--text-primary)'
    },
    modalClose: {
      background: 'transparent',
      border: 'none',
      fontSize: '24px',
      lineHeight: '1',
      cursor: 'pointer',
      color: 'var(--text-secondary)'
    },
    modalBody: {
      padding: '24px',
      fontSize: '14px',
      color: 'var(--text-primary)'
    },
    modalRow: {
      marginBottom: '12px',
      lineHeight: '1.5'
    }
  }

  const renderContent = () => {
    const filteredPending = pendingClubs.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const filteredApproved = approvedClubs.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeTab === 'home') {
      return (
        <div>
          <div style={s.headerRow}>
            <h2 style={s.title}>Genel Bakış</h2>
          </div>
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
          <div style={s.headerRow}>
            <h2 style={s.title}>Topluluk Başvuruları</h2>
            <input 
              type="text" 
              placeholder="Topluluk ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={s.searchInput}
            />
          </div>
          {dataLoading ? (
            <div>Yükleniyor...</div>
          ) : filteredPending.length === 0 ? (
            <div style={s.emptyState}>{searchQuery ? 'Aramanıza uygun başvuru bulunamadı' : 'Bekleyen başvuru bulunmuyor 🎉'}</div>
          ) : (
            <div style={s.cardList}>
              {filteredPending.map(club => (
                <div key={club.id} style={s.clubCard}>
                  <div style={s.clubInfo}>
                    <div style={s.clubName}>{club.name}</div>
                    <div style={s.clubCategory}>{club.category}</div>
                    <div style={s.clubDesc}>{club.description || 'Açıklama belirtilmemiş.'}</div>

                    <div style={s.contactCard}>
                      <div style={s.contactTitle}>Sorumlu Kişi Bilgileri</div>
                      <div style={s.contactLine}><strong>Ad Soyad:</strong> {club.owner_name}</div>
                      <div style={s.contactLine}><strong>E-posta:</strong> {club.owner_email}</div>
                      <div style={s.contactLine}><strong>Telefon:</strong> {club.owner_phone}</div>
                    </div>

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
          <div style={s.headerRow}>
            <h2 style={s.title}>Onaylanan Topluluklar</h2>
            <input 
              type="text" 
              placeholder="Topluluk ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={s.searchInput}
            />
          </div>
          {dataLoading ? (
            <div>Yükleniyor...</div>
          ) : filteredApproved.length === 0 ? (
            <div style={s.emptyState}>{searchQuery ? 'Aramanıza uygun topluluk bulunamadı' : 'Henüz onaylanmış bir topluluk bulunmuyor.'}</div>
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
                  {filteredApproved.map(club => (
                    <tr 
                      key={club.id} 
                      onClick={() => handleRowClick(club)} 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
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

    if (activeTab === 'users') {
      const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )

      const getRoleLabel = (role) => {
        if (role === 'student') return 'Öğrenci'
        if (role === 'club_owner') return 'Kulüp Yöneticisi'
        if (role === 'sks_staff') return 'SKS Personeli'
        return role
      }

      return (
        <div>
          <div style={s.headerRow}>
            <h2 style={s.title}>Kullanıcılar</h2>
            <input 
              type="text" 
              placeholder="İsim veya e-posta ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={s.searchInput}
            />
          </div>
          {dataLoading && <div>Yükleniyor...</div>}
          
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Ad Soyad</th>
                  <th style={s.th}>E-posta</th>
                  <th style={s.th}>Rol</th>
                  <th style={s.th}>Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && !dataLoading && (
                  <tr>
                    <td colSpan="4" style={s.emptyState}>
                      {searchQuery ? 'Aramanıza uygun kullanıcı bulunamadı' : 'Kayıtlı kullanıcı bulunmuyor'}
                    </td>
                  </tr>
                )}
                {filteredUsers.map(u => (
                  <tr 
                    key={u.id}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ ...s.td, fontWeight: '600' }}>{u.full_name}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}><span style={s.clubCategory}>{getRoleLabel(u.role)}</span></td>
                    <td style={s.td}>{u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        @keyframes modalIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
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

        {/* Toast */}
        {toast && <div style={s.toast}>{toast}</div>}

        {/* Modal Overlay */}
        {selectedClub && (
          <div style={s.modalOverlay} onClick={() => setSelectedClub(null)}>
            <div style={s.modalContent} onClick={e => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <h3 style={s.modalTitle}>Topluluk Detayları</h3>
                <button style={s.modalClose} onClick={() => setSelectedClub(null)}>×</button>
              </div>
              <div style={s.modalBody}>
                <div style={s.modalRow}><strong>Kulüp Adı:</strong> {selectedClub.name}</div>
                <div style={s.modalRow}><strong>Kategori:</strong> {selectedClub.category}</div>
                <div style={s.modalRow}><strong>Açıklama:</strong> {selectedClub.description || '-'}</div>
                <div style={s.modalRow}><strong>Kayıt Tarihi:</strong> {new Date(selectedClub.created_at).toLocaleDateString('tr-TR')}</div>
                <hr style={{ margin: '16px 0', borderColor: 'var(--border)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />
                <div style={s.modalRow}><strong>Danışman Adı:</strong> {selectedClub.owner_name}</div>
                <div style={s.modalRow}><strong>Danışman Fakültesi:</strong> {selectedClub.owner_department}</div>
                <div style={s.modalRow}><strong>Danışman Mail:</strong> {selectedClub.owner_email}</div>
                <div style={s.modalRow}>
                  <strong>Üye Sayısı:</strong> {modalLoading ? 'Yükleniyor...' : clubMemberCount}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
