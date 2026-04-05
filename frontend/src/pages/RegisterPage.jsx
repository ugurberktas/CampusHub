import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Lütfen tüm alanları doldurunuz");
      return;
    }
    if (!form.email.toLowerCase().endsWith(".edu.tr")) {
      setError("Lütfen geçerli bir üniversite e-postası giriniz (@...edu.tr)");
      return;
    }
    if (form.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return;
    }

    setLoading(true);
    try {
      await register(form.email, form.password, form.full_name, form.department);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Kayıt başarısız. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div className="card" style={styles.card}>
        {/* Brand */}
        <div style={styles.brandWrap}>
          <div style={{width:70, height:70, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px'}}>
            <span style={{color:'white', fontSize:28, fontWeight:700}}>C</span>
          </div>
          <h1 style={styles.brandName}>Kampüse Katıl</h1>
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
            <label style={styles.label}>Ad Soyad</label>
            <input
              className="input-field"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Ada Lovelace"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>E-posta</label>
            <input
              className="input-field"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="kullanici@firat.edu.tr"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Şifre</label>
            <input
              className="input-field"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Bölüm <span style={styles.optional}>(isteğe bağlı)</span></label>
            <input
              className="input-field"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Bilgisayar Mühendisliği"
            />
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: 8, padding: "12px 24px", fontSize: 15 }}
          >
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p style={styles.footer}>
          Zaten hesabın var mı?{" "}
          <Link to="/login" style={styles.link}>Giriş yap</Link>
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
    fontSize: 26,
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
  optional: {
    fontWeight: 400,
    color: "var(--text-gray)",
    fontSize: 12,
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
