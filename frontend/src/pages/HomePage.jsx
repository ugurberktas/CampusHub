import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function HomePage() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/events")
      .then((res) => setEvents(res.data))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div style={styles.wrapper}>
      {/* ── Navbar ── */}
      <nav style={styles.navbar}>
        <span style={styles.navBrand}>Campus Hub</span>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👤 {user?.full_name}</span>
          <button onClick={logout} style={styles.logoutBtn}>
            Çıkış Yap
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main style={styles.main}>
        {/* Welcome banner */}
        <div style={styles.welcomeBanner}>
          <div>
            <h2 style={styles.welcomeTitle}>Hoş geldin, {user?.full_name?.split(" ")[0]} 👋</h2>
            <p style={styles.welcomeSub}>Kampüs etkinliklerini keşfet ve kayıt ol.</p>
          </div>
          <div style={styles.welcomeBadge}>{user?.role}</div>
        </div>

        {/* Section header */}
        <h3 style={styles.sectionTitle}>Yaklaşan Etkinlikler</h3>

        {/* Events */}
        {eventsLoading ? (
          <p style={styles.emptyMsg}>Etkinlikler yükleniyor...</p>
        ) : events.length === 0 ? (
          <div style={styles.emptyCard}>
            <span style={{ fontSize: 40 }}>📅</span>
            <p style={{ margin: "12px 0 0", color: "var(--text-gray)", fontSize: 15 }}>
              Henüz etkinlik bulunmuyor
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {events.map((event) => (
              <div key={event.id} className="card" style={styles.eventCard}>
                <h4 style={styles.eventTitle}>{event.title}</h4>

                {event.location && (
                  <p style={styles.eventMeta}>
                    <span style={styles.metaIcon}>📍</span>
                    {event.location}
                  </p>
                )}

                <p style={styles.eventMeta}>
                  <span style={styles.metaIcon}>🗓</span>
                  {formatDate(event.event_date)}
                </p>

                <p style={styles.eventMeta}>
                  <span style={styles.metaIcon}>👥</span>
                  {event.registration_count} kişi kayıtlı
                  {event.capacity ? ` / ${event.capacity} kapasite` : ""}
                </p>

                <button
                  className="btn-primary"
                  style={{ width: "100%", marginTop: "auto", paddingTop: 10, paddingBottom: 10 }}
                >
                  Kayıt Ol
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "var(--bg-light)",
    display: "flex",
    flexDirection: "column",
  },

  /* Navbar */
  navbar: {
    background: "var(--primary)",
    height: 60,
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navBrand: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  navUser: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 14,
  },
  logoutBtn: {
    background: "transparent",
    color: "#FFFFFF",
    border: "1.5px solid rgba(255,255,255,0.6)",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s",
  },

  /* Main */
  main: {
    maxWidth: 1200,
    width: "100%",
    margin: "0 auto",
    padding: "32px 24px",
    flex: 1,
  },

  /* Welcome banner */
  welcomeBanner: {
    background: "var(--white)",
    border: "1px solid var(--primary-light)",
    borderLeft: "4px solid var(--primary)",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--text-dark)",
    margin: 0,
  },
  welcomeSub: {
    fontSize: 14,
    color: "var(--text-gray)",
    marginTop: 4,
  },
  welcomeBadge: {
    background: "var(--primary-light)",
    color: "var(--primary)",
    borderRadius: 20,
    padding: "4px 14px",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  },

  /* Section */
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "var(--text-dark)",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },

  /* Event card */
  eventCard: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 24,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--primary)",
    margin: 0,
    lineHeight: 1.4,
  },
  eventMeta: {
    fontSize: 13,
    color: "var(--text-gray)",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  metaIcon: {
    fontSize: 14,
    flexShrink: 0,
  },

  /* Empty state */
  emptyMsg: {
    color: "var(--text-gray)",
    fontSize: 14,
  },
  emptyCard: {
    textAlign: "center",
    padding: "60px 24px",
    background: "var(--white)",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
};
