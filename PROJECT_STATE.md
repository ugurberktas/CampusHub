# PROJECT_STATE - Campus Hub Beyin Dosyası

Bu dosya **Campus Hub** projesinin güncel durumunu, mimarisini ve yapılacaklar listesini (To-Do) takip etmek için oluşturulmuş bir hafıza sistemidir. **KURAL: Her işlem, biten her task veya yapılan her kritik değişiklikten sonra bu dosya otomatik olarak güncellenecektir.**

---

## 🏗️ Proje Özeti ve Mimari (Current Architecture)

**Campus Hub**, üniversite öğrenci toplulukları, kulüpler ve işletmeler için tasarlanmış kapalı devre bir SaaS (Software as a Service) projesidir.

*   **Backend:** Python + FastAPI
*   **Veritabanı (Database):** PostgreSQL 15 (Docker üzerinden)
*   **Veritabanı Yönetimi:** pgAdmin4
*   **Konteynerleştirme:** Docker & Docker Compose
*   **Frontend:** React.js + Vite (localhost:3000) — Auth, Kulüpler ve Etkinlik Detay sayfaları tamamlandı

---

## ✅ Tamamlananlar (Completed)

1.  **Proje İskeleti:** Klasör yapısı, `.gitignore`, `.env`, `requirements.txt` oluşturuldu.
2.  **Docker Kurulumu:** PostgreSQL 15, pgAdmin ve FastAPI servisleri ayağa kaldırıldı ve birbirine bağlandı.
3.  **Veritabanı Modelleri:** SQLAlchemy ile 15 tablo oluşturuldu:
    *   `universities`, `users`, `clubs`, `club_members`, `posts`, `events`, `event_registrations`, `attendance`, `certificates`, `salons`, `salon_reservations`, `applications`, `follows`, `notifications`, `interest_areas`
4.  **Auth Sistemi (`feature/auth`):** JWT, rol sistemi, `.edu.tr` doğrulama, register/login/me endpoint'leri ✔
5.  **Kulüp Yönetimi (`feature/clubs`):** Oluşturma, listeleme, SKS onay/red/askı sistemi, üye yönetimi ✔
6.  **Etkinlik Yönetimi (`feature/events`):**
    *   `POST /events` — Etkinlik oluştur (club owner/core_team)
    *   `GET /events` — Yaklaşan etkinlikleri listele (public, tarih sıralı)
    *   `GET /events/{event_id}` — Etkinlik detayı (public)
    *   `DELETE /events/{event_id}` — Etkinliği sil (club owner/core_team)
    *   `POST /events/{event_id}/register` — Kayıt ol (kapasite & mükerrer kontrolü + erken uyarı)
    *   `GET /events/{event_id}/registrations` — Kayıtlı kullanıcıları listele (club staff)
7.  **Frontend (`feature/kulup-arayuzu`):** React + Vite kurulumu tamamlandı:
    *   `LoginPage.jsx`, `RegisterPage.jsx`, `HomePage.jsx` — Auth akışı ✔
    *   `ClubsPage.jsx`, `ClubCard.jsx` — Kulüp listesi (arama + kategori filtresi) ✔
    *   `ClubDetailPage.jsx` — Kulüp detay + Takip Et butonu ✔
    *   `EventDetailPage.jsx` — Etkinlik detay + Kayıt Ol butonu ✔
    *   `src/api/axios.js` — JWT interceptor ✔
    *   `src/context/AuthContext.jsx` — Global auth state ✔
    *   `src/App.jsx` — Route: `/`, `/clubs`, `/clubs/:id`, `/events/:id` ✔
8.  **CORS Middleware (`backend/main.py`):** `CORSMiddleware` eklendi — `http://localhost:3000` origin'ine izin verildi ✔
9.  **Login Bug Fixes (`app/routers/auth.py` & `LoginPage.jsx`):** 422 Validasyon hataları frontend'de düzeltildi ve backend'de `EmailStr` tabanlı 422 fırlatmaları güvenli 401 Unauthorized'a dönüştürüldü ✔
10. **Global Hata Yönetimi:** Tüm frontend sayfalarında (Register, Clubs, ClubDetail, EventDetail) API hata parsing mantığı, potansiyel obje bazlı yanıtları (string olmayan validation error'ları) güvenle karşılayacak şekilde güncellendi ✔
11. **Login 422 Hatası Düzeltmesi (`AuthContext.jsx`):** `/auth/login` isteğindeki `username` field'ı `email` olarak düzeltildi — backend şemasıyla uyumlu hale getirildi ✔
12. **Rol Bazlı Yönlendirme (`LoginPage.jsx`):** Login sonrası `sks_staff` → `/sks-panel`, `club_owner` → `/club-panel`, diğerleri → `/` olacak şekilde tam rol yönlendirmesi eklendi ✔
13. **SKS Ayrı Giriş Sayfası (`SKSLoginPage.jsx`):** SKS Personeli kartı `LoginPage.jsx`'ten kaldırıldı. Özel `/sks-login` rotası ve `SKSLoginPage.jsx` oluşturuldu — koyu mavi tasarım, yalnızca email + şifre inputu, başarılı girişte `/sks-panel` yönlendirmesi, rol uyuşmazlığında Türkçe hata mesajı ✔
14. **PublicRoute Rol Yönlendirmesi (`App.jsx`):** `club_owner` için `/club-panel` yönlendirmesi de eklendi ✔
15. **SKSLoginPage Yeniden Tasarımı (`SKSLoginPage.jsx`):** Sol panel kaldırıldı, tek sütun ortalanmış kart yapısına geçildi. Arka plan `#ffffff`, primary `#8B0000` (Fırat bordo). Logo, başlık, email input, şifre input, giriş butonu ve alt kısımda `/login` linki — `LoginPage.jsx` ile birebir aynı stil token'ları kullanılıyor ✔

---

## 🔄 Devam Edenler (In Progress)

*   `feature/auth` branch'i açık, henüz `dev`'e merge edilmedi.

---

## 🐛 Bilinen Hatalar (Known Bugs)

| # | Dosya | Hata | Durum |
|---|---|---|---|
| 1 | `AuthContext.jsx` | `/auth/login` payload'ında `username: email` kullanılıyor — backend `email` field bekliyor. Kullanıcı nano ile geri döndürdü, backend şeması net değil. | **Açık / Doğrulama Bekliyor** |

---

## 🎯 Sonraki Adımlar (To-Do List)

- [x] **`/auth/login` endpoint testini tamamla**
- [x] **`feature/auth` → `dev` merge işlemi**
- [x] **`feature/clubs` branch aç** — Kulüp yönetimi API'si tamamlandı ✔
- [x] **`feature/events` branch aç** — Etkinlik yönetimi API'si tamamlandı ✔
- [x] **`feature/qr` branch aç** — Etkinlik QR kod katılım sistemi (Attendance + Certificate)
- [x] **`feature/frontend` başlat** — Clubs UI + Events UI modülleri tamamlandı (`feature/kulup-arayuzu`) ✔
- [x] **SKS ayrı giriş sayfası** — `SKSLoginPage.jsx` + `/sks-login` rotası ✔
- [ ] **`AuthContext.jsx` login payload'ı doğrula** — `email` mi `username` mı? Backend `auth.py` şeması kontrol edilmeli
- [ ] **ClubPanel.jsx** — `club_owner` rolü için panel sayfası (`/club-panel`)
- [ ] **EventsPage.jsx** — Tüm etkinlikleri listeleyen sayfa (`GET /events`)
- [ ] **ProfilePage.jsx** — Kullanıcı profil sayfası
- [ ] **QR katılım sistemi** — Etkinlik QR tarama akışı

---

## 🌿 Branch Stratejisi (Branch Strategy)

| Branch | Durum | Açıklama |
|---|---|---|
| `main` | Aktif | Kararlı (stable) kod |
| `dev` | Aktif | Ana geliştirme ortamı |
| `feature/database-models` | Merged | `dev`'e merge edildi ✔ |
| `feature/auth` | Merged | `dev`'e merge edildi ✔ |
| `feature/clubs` | Merged | `dev`'e merge edildi ✔ |
| `feature/events` | In Progress | Devam ediyor, merge bekliyor |
| `feature/kulup-arayuzu` | In Progress | Frontend: Clubs UI + Events UI tamamlandı |

---

*Son güncelleme: 2026-05-04 (SKSLoginPage yeniden tasarlandı)*
