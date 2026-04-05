import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!email.trim() || !password.trim()) {
      setError("Lütfen tüm alanları doldurunuz");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.detail || "Giriş başarısız. Bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div className="card" style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.brandWrap}>
          <div style={{width:70, height:70, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px'}}>
            <span style={{color:'white', fontSize:28, fontWeight:700}}>C</span>
          </div>
          <h1 style={styles.brandName}>Campus Hub</h1>
          <p style={styles.subtitle}>Fırat Üniversitesi Kampüs Portalı</p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <span style={{ marginRight: 6 }}>⚠️</span>{error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>E-posta</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kullanici@firat.edu.tr"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Şifre</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: 8, padding: "12px 24px", fontSize: 15 }}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p style={styles.footer}>
          Hesabın yok mu?{" "}
          <Link to="/register" style={styles.link}>Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-light)",
    padding: "24px 16px",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 40,
  },
  brandWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 28,
    gap: 8,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "var(--primary)",
    color: "var(--white)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 700,
    color: "var(--primary)",
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: "var(--text-gray)",
    margin: 0,
  },
  errorBox: {
    background: "#FDECEA",
    color: "var(--error)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-dark)",
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 14,
    color: "var(--text-gray)",
  },
  link: {
    color: "var(--primary)",
    fontWeight: 600,
    textDecoration: "none",
  },
};
