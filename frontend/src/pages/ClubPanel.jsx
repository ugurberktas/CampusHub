import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function ClubPanel() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [club, setClub] = useState(null)
  const [loadingClub, setLoadingClub] = useState(true)
  const [error, setError] = useState('')

  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await api.get('/clubs/my-club')
        setClub(res.data)
      } catch (err) {
        setError('Kulüp bilgileri alınamadı veya kulübünüz yok.')
      } finally {
        setLoadingClub(false)
      }
    }
    fetchClub()
  }, [])

  useEffect(() => {
    if (!club) return
    if (activeTab === 'overview' || activeTab === 'events') {
      fetchEvents()
    }
    if (activeTab === 'members') {
      fetchMembers()
    }
  }, [activeTab, club])

  const fetchEvents = async () => {
    setLoadingEvents(true)
    try {
      const res = await api.get(`/events?club_id=${club.id}`)
      setEvents(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingEvents(false)
    }
  }

  const fetchMembers = async () => {
    setLoadingMembers(true)
    try {
      const res = await api.get(`/clubs/${club.id}/members`)
      setMembers(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMembers(false)
    }
  }

  const removeMember = async (userId) => {
    if (!window.confirm('Bu üyeyi kulüpten çıkarmak istediğinize emin misiniz?')) return
    try {
      await api.delete(`/clubs/${club.id}/members/${userId}`)
      setMembers(members.filter(m => m.user_id !== userId))
    } catch (err) {
      alert(err.response?.data?.detail || 'Üye silinirken bir hata oluştu.')
    }
  }

  const deleteEvent = async (eventId) => {
    if (!window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return
    try {
      await api.delete(`/events/${eventId}`)
      setEvents(events.filter(e => e.id !== eventId))
    } catch (err) {
      alert(err.response?.data?.detail || 'Etkinlik silinirken bir hata oluştu.')
    }
  }

  const [form, setForm] = useState({ title: '', description: '', event_date: '', location: '', capacity: '' })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [creating, setCreating] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('club_id', club.id)
      formData.append('event_date', new Date(form.event_date).toISOString())
      if (form.description) formData.append('description', form.description)
      if (form.location) formData.append('location', form.location)
      if (form.capacity) formData.append('capacity', parseInt(form.capacity))
      if (image) formData.append('image', image)

      await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      alert('Etkinlik başarıyla oluşturuldu!')
      setForm({ title: '', description: '', event_date: '', location: '', capacity: '' })
      setImage(null)
      setPreview(null)
      setActiveTab('events')
    } catch (err) {
      alert(err.response?.data?.detail || 'Etkinlik oluşturulurken hata oluştu.')
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const s = {
    container: { display: 'flex', minHeight: '100vh', background: 'var(--bg-surface)' },
    sidebar: { width: '280px', background: 'linear-gradient(180deg, #8B0000 0%, #5a0000 100%)', color: '#fff', display: 'flex', flexDirection: 'column', padding: '24px', flexShrink: 0 },
    logoText: { fontSize: '28px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '32px' },
    clubInfoBox: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '32px' },
    clubName: { fontWeight: '700', fontSize: '18px', marginBottom: '8px' },
    badge: (status) => ({
      display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
      background: status === 'active' ? '#2e7d32' : status === 'pending' ? '#f57f17' : '#c62828',
      color: '#fff'
    }),
    navMenu: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    navItem: (active) => ({
      padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: '#fff', textDecoration: 'none', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
      background: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
      transition: 'background var(--transition)',
    }),
    logoutBtn: { background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', padding: '12px', borderRadius: 'var(--radius-sm)', fontWeight: '600', cursor: 'pointer', marginTop: 'auto' },
    mainContent: { flex: 1, padding: '40px', overflowY: 'auto' },
    sectionTitle: { fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '24px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' },
    statCard: { background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column' },
    statLabel: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' },
    statValue: { fontSize: '28px', fontWeight: '700', color: 'var(--primary)' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
    th: { padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' },
    td: { padding: '16px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '14px' },
    deleteBtn: { background: 'var(--primary-muted)', color: 'var(--primary)', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
    emptyState: { background: 'var(--bg-card)', padding: '32px', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)' },
    eventGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '16px' },
    eventCard: { background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-sm)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    field: { display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 1' },
    fullField: { display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' },
    label: { fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' },
    input: { padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-surface)' },
    submitBtn: { background: 'var(--primary)', color: '#fff', border: 'none', padding: '14px', borderRadius: 'var(--radius-sm)', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' },
    previewImg: { width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginTop: '8px' }
  }

  if (loadingClub) return <div style={{ padding: '40px' }}>Yükleniyor...</div>
  if (error || !club) return <div style={{ padding: '40px', color: 'red' }}>{error}</div>

  return (
    <div style={s.container}>
      <div style={s.sidebar}>
        <div style={s.logoText}>Campus Hub</div>
        <div style={s.clubInfoBox}>
          <div style={s.clubName}>{club.name}</div>
          <div style={s.badge(club.status)}>
            {club.status === 'active' ? 'Onaylı' : club.status === 'pending' ? 'Beklemede' : 'Askıda'}
          </div>
        </div>
        <div style={s.navMenu}>
          <div style={s.navItem(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>📊 Genel Bakış</div>
          <div style={s.navItem(activeTab === 'members')} onClick={() => setActiveTab('members')}>👥 Üyeler</div>
          <div style={s.navItem(activeTab === 'events')} onClick={() => setActiveTab('events')}>📅 Etkinlikler</div>
          <div style={s.navItem(activeTab === 'create_event')} onClick={() => setActiveTab('create_event')}>➕ Etkinlik Oluştur</div>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>Çıkış Yap</button>
      </div>

      <div style={s.mainContent}>
        {activeTab === 'overview' && (
          <div>
            <h2 style={s.sectionTitle}>Genel Bakış</h2>
            <div style={s.statsGrid}>
              <div style={s.statCard}>
                <div style={s.statLabel}>Üye Sayısı</div>
                <div style={s.statValue}>{club.follower_count || 0}</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statLabel}>Etkinlik Sayısı</div>
                <div style={s.statValue}>{events.length}</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statLabel}>Yaklaşan Etkinlik</div>
                <div style={s.statValue}>{events.filter(e => new Date(e.event_date) > new Date()).length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <h2 style={s.sectionTitle}>Üyeler</h2>
            {loadingMembers ? <div>Yükleniyor...</div> : members.length > 0 ? (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Ad Soyad</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Bölüm / Sınıf</th>
                    <th style={s.th}>Rol</th>
                    <th style={s.th}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id}>
                      <td style={s.td}>{m.full_name}</td>
                      <td style={s.td}>{m.email}</td>
                      <td style={s.td}>{m.department} - {m.grade}</td>
                      <td style={s.td}>{m.role}</td>
                      <td style={s.td}>
                        {m.role !== 'owner' && (
                          <button style={s.deleteBtn} onClick={() => removeMember(m.user_id)}>Çıkar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div style={s.emptyState}>Henüz üye bulunmuyor.</div>}
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <h2 style={s.sectionTitle}>Etkinlikler</h2>
            {loadingEvents ? <div>Yükleniyor...</div> : events.length > 0 ? (
              <div style={s.eventGrid}>
                {events.map(e => (
                  <div key={e.id} style={s.eventCard}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text-primary)' }}>{e.title}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        📅 {new Date(e.event_date).toLocaleString('tr-TR')} • 📍 {e.location || 'Konum yok'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--primary)', marginTop: '4px' }}>
                        Kayıtlı Kişi: {e.registration_count || 0} / {e.capacity || 'Sınırsız'}
                      </div>
                    </div>
                    <button style={s.deleteBtn} onClick={() => deleteEvent(e.id)}>Sil</button>
                  </div>
                ))}
              </div>
            ) : <div style={s.emptyState}>Henüz etkinlik oluşturulmadı.</div>}
          </div>
        )}

        {activeTab === 'create_event' && (
          <div>
            <h2 style={s.sectionTitle}>Yeni Etkinlik Oluştur</h2>
            <form onSubmit={handleCreateEvent} style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: 'var(--radius)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={s.formGrid}>
                <div style={s.fullField}>
                  <label style={s.label}>Etkinlik Adı *</label>
                  <input style={s.input} required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Tarih ve Saat *</label>
                  <input style={s.input} type="datetime-local" required value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Kapasite *</label>
                  <input style={s.input} type="number" required value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} />
                </div>
                <div style={s.fullField}>
                  <label style={s.label}>Konum *</label>
                  <input style={s.input} required value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                </div>
                <div style={s.fullField}>
                  <label style={s.label}>Açıklama *</label>
                  <textarea style={{...s.input, minHeight: '100px'}} required value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div style={s.fullField}>
                  <label style={s.label}>Etkinlik Görseli (Opsiyonel - Sadece jpg/png/webp)</label>
                  <input style={s.input} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleImageChange} />
                  {preview && <img src={preview} alt="Önizleme" style={s.previewImg} />}
                </div>
              </div>
              <button type="submit" style={s.submitBtn} disabled={creating}>
                {creating ? 'Oluşturuluyor...' : 'Etkinliği Oluştur'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
