# PROJECT_STATE - Campus Hub Beyin Dosyası

Bu dosya **Campus Hub** projesinin güncel durumunu, mimarisini ve yapılacaklar listesini (To-Do) takip etmek için oluşturulmuş bir hafıza sistemidir. **KURAL: Her işlem, biten her task veya yapılan her kritik değişiklikten sonra bu dosya otomatik olarak güncellenecektir.**

---

## 🏗️ Proje Özeti ve Mimari (Current Architecture)

**Campus Hub**, üniversite öğrenci toplulukları, kulüpler ve işletmeler için tasarlanmış kapalı devre bir SaaS (Software as a Service) projesidir.

*   **Backend:** Python + FastAPI
*   **Veritabanı (Database):** PostgreSQL 15 (Docker üzerinden)
*   **Veritabanı Yönetimi:** pgAdmin4
*   **Konteynerleştirme:** Docker & Docker Compose
*   **Frontend:** React.js + Vite (auth sayfaları tamamlandı — Login, Register, Home)

---

## ✅ Tamamlananlar (Completed)

1.  **Proje İskeleti:** Klasör yapısı, `.gitignore`, `.env`, `requirements.txt` oluşturuldu.
2.  **Docker Kurulumu:** PostgreSQL 15, pgAdmin ve FastAPI servisleri ayağa kaldırıldı ve birbirine bağlandı.
3.  **Veritabanı Modelleri:** SQLAlchemy ile 15 tablo oluşturuldu:
    *   `universities`, `users`, `clubs`, `club_members`, `posts`, `events`, `event_registrations`, `attendance`, `certificates`, `salons`, `salon_reservations`, `applications`, `follows`, `notifications`, `interest_areas`
4.  **Auth Sistemi (`feature/auth`):** JWT, rol sistemi, `.edu.tr` doğrulama, register/login/me endpoint'leri ✔
5.  **Kulüp Yönetimi (`feature/clubs`):** Oluşturma, listeleme, SKS onay/red/askı sistemi, üye yönetimi ✔
6.  **Etkinlik Yönetimi (`feature/events`):** Oluşturma, listeleme, kayıt, erken uyarı sistemi ✔
7.  **Frontend (`feature/frontend`):**
    *   Vite + React.js kurulumu tamamlandı
    *   `axios` ile API entegrasyonu, JWT interceptor
    *   `AuthContext` — login, register, logout, auto-login
    *   `PrivateRoute` — korumalı sayfa yönlendirmesi
    *   `/login` — e-posta/şifre giriş formu
    *   `/register` — tam kayıt formu (full_name, email, şifre, bölüm)
    *   `/home` — korumalı; kullanıcı hoş geldin + yaklaşan etkinlikler listesi
    *   `docker-compose.yml`'e frontend servisi eklendi (port 3000)

---

## 🔄 Devam Edenler (In Progress)

*   `feature/auth` branch'i açık, henüz `dev`'e merge edilmedi.

---

## 🎯 Sonraki Adımlar (To-Do List)

- [x] **`/auth/login` endpoint testini tamamla**
- [x] **`feature/auth` → `dev` merge işlemi**
- [x] **`feature/clubs` branch aç** — Kulüp yönetimi API'si tamamlandı ✔
- [x] **`feature/events` branch aç** — Etkinlik yönetimi API'si tamamlandı ✔
- [x] **`feature/frontend` branch aç** — React.js auth sayfaları tamamlandı ✔
- [ ] **`feature/qr` branch aç** — Etkinlik QR kod katılım sistemi (Attendance + Certificate)
- [ ] **Frontend genişletme** — Kulüp listesi, etkinlik detay, profil sayfası

---

## 🌿 Branch Stratejisi (Branch Strategy)

| Branch | Durum | Açıklama |
|---|---|---|
| `main` | Aktif | Kararlı (stable) kod |
| `dev` | Aktif | Ana geliştirme ortamı |
| `feature/database-models` | Merged | `dev`'e merge edildi ✔ |
| `feature/auth` | Merged | `dev`'e merge edildi ✔ |
| `feature/clubs` | Merged | `dev`'e merge edildi ✔ |
| `feature/events` | Merged | `dev`'e merge edildi ✔ |
| `feature/frontend` | In Progress | Devam ediyor, merge bekliyor |

---

*Son güncelleme: 2026-04-05*
