# PROJECT_STATE - Campus Hub Beyin Dosyası

Bu dosya **Campus Hub** projesinin güncel durumunu, mimarisini ve yapılacaklar listesini (To-Do) takip etmek için oluşturulmuş bir hafıza sistemidir. **KURAL: Her işlem, biten her task veya yapılan her kritik değişiklikten sonra bu dosya otomatik olarak güncellenecektir.**

---

## 🏗️ Proje Özeti ve Mimari (Current Architecture)

**Campus Hub**, üniversite öğrenci toplulukları, kulüpler ve işletmeler için tasarlanmış kapalı devre bir SaaS (Software as a Service) projesidir.

*   **Backend:** Python + FastAPI
*   **Veritabanı (Database):** PostgreSQL 15 (Docker üzerinden)
*   **Veritabanı Yönetimi:** pgAdmin4
*   **Konteynerleştirme:** Docker & Docker Compose
*   **Frontend:** React.js + Vite (localhost:3000) — Auth ve SKS Panel sayfaları mevcut (Frontend sıfırdan yeniden yapılandırılıyor, eski arayüzler temizlendi)

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
7.  **Frontend (`feature/frontend-yeniden`):** React + Vite ile yeniden başlatıldı:
    *   `LoginPage.jsx`, `StudentRegisterPage.jsx`, `ClubRegisterPage.jsx`, `SKSLoginPage.jsx`, `SKSPanel.jsx` — Auth ve SKS Panel sayfaları mevcut ✔
    *   `src/api/axios.js` — JWT interceptor ✔
    *   `src/context/AuthContext.jsx` — Global auth state ✔
    *   `src/App.jsx` — Protected/Public route'lar ayarlandı. `/`, `/clubs`, `/events` ve `/profile` şu an `PlaceholderPage` ile geçici olarak tutuluyor ✔
8.  **CORS Middleware (`backend/main.py`):** `CORSMiddleware` eklendi — `http://localhost:3000` origin'ine izin verildi ✔
9.  **Login Bug Fixes (`app/routers/auth.py` & `LoginPage.jsx`):** 422 Validasyon hataları frontend'de düzeltildi ve backend'de `EmailStr` tabanlı 422 fırlatmaları güvenli 401 Unauthorized'a dönüştürüldü ✔
10. **Global Hata Yönetimi:** Tüm frontend auth sayfalarında API hata parsing mantığı güncellendi ✔
11. **Login 422 Hatası Düzeltmesi (`AuthContext.jsx`):** `/auth/login` isteğindeki `username` field'ı `email` olarak düzeltildi — backend şemasıyla uyumlu hale getirildi ✔
12. **Rol Bazlı Yönlendirme (`LoginPage.jsx`):** Login sonrası `club_owner` → `/club-panel`, diğerleri → `/` — `sks_staff` için `/sks-panel` yönlendirmesi kaldırıldı ✔
13. **SKS Ayrı Giriş Sayfası (`SKSLoginPage.jsx`):** SKS Personeli kartı `LoginPage.jsx`'ten kaldırıldı. Özel `/sks-login` rotası ve `SKSLoginPage.jsx` oluşturuldu — yalnızca email + şifre inputu, rol uyuşmazlığında Türkçe hata mesajı ✔ (`/sks-panel` yönlendirmesi devre dışı)
14. **PublicRoute Rol Yönlendirmesi (`App.jsx`):** `club_owner` için `/club-panel` yönlendirmesi de eklendi ✔
15. **SKSLoginPage Yeniden Tasarımı (`SKSLoginPage.jsx`):** Sol panel kaldırıldı, tek sütun ortalanmış kart yapısına geçildi. Arka plan `#ffffff`, primary `#8B0000` (Fırat bordo). Logo, başlık, email input, şifre input, giriş butonu ve alt kısımda `/login` linki — `LoginPage.jsx` ile birebir aynı stil token'ları kullanılıyor ✔
16. **`GET /sks/stats` Endpoint (`backend/app/routers/sks.py`):** Yeni `sks.py` router oluşturuldu. `GET /sks/stats` — yalnızca `sks_staff` JWT ile erişilebilir; `total_users`, `total_clubs`, `total_events` döndürür. `main.py`'e `/sks` prefix'iyle kaydedildi ✔
17. **SKSPanel Toplam Kullanıcı Kartı (`SKSPanel.jsx`):** `--` sabit değeri kaldırıldı. `fetchDashboardStats` içine `GET /sks/stats` eklendi; kart artık gerçek `total_users` sayısını gösteriyor. Yüklenirken `--`, hata durumunda `Hata` yazıyor ✔
18. **Giriş Sayfaları (Placeholders):** `OgrenciGiris.jsx`, `ToplulukGiris.jsx` ve `SksGiris.jsx` sayfaları geçici (placeholder) olarak oluşturuldu ✔
19. **React Temel Altyapı ve Routing:** `index.css` (Tailwind), `axios.js`, `AuthContext.jsx`, `main.jsx` ve `App.jsx` (React Router v7) dosyaları başarıyla oluşturuldu ve birbirine bağlandı ✔
20. **LandingPage Yönlendirmeleri:** Navbar linkleri (`Öğrenciler`, `Topluluklar`) işlevsel hale getirildi. Hero bölümünün altına Öğrenci ve Topluluk girişleri için interaktif iki adet kart eklendi ✔
21. **Öğrenci Giriş Sayfası (`OgrenciGiris.jsx`):** Split-screen (ikiye bölünmüş) tasarım uygulandı. Sol tarafa marka alanı, sağ tarafa ise `useAuth` tabanlı, rol kontrollü (öğrenci harici rollere özel hata mesajı) giriş formu entegre edildi ✔
22. **Hata Yakalama (Axios):** `axios.js` içerisindeki 401 response interceptor güncellendi. Başarısız login istekleri (`/auth/login`) anında logout tetiklemek yerine reject edilerek login formuna iletilecek hale getirildi ✔
23. **Kayıt Rotaları (`App.jsx`):** `/ogrenci-kayit` ve `/topluluk-kayit` (PublicOnlyRoute) rotaları `App.jsx` içerisine geçici (placeholder) componentler ile eklendi ✔
24. **Topluluk Giriş Sayfası (`ToplulukGiris.jsx`):** Öğrenci giriş sayfasıyla aynı split-screen mimarisine oturtuldu. `useAuth` login sistemi üzerinden role dayalı doğrulama ve yalnızca topluluk sahiplerine (`club_owner`) özel giriş mantığı entegre edildi ✔
25. **Hata Yakalama (AuthContext):** `login` fonksiyonu içerisinde eksik olan `try/catch` bloğu eklendi. Backend'den dönen HTTP hatalarının yutulması önlenerek çağıran sayfaya (caller) fırlatılması sağlandı ✔
26. **SKS Giriş Sayfası (`SksGiris.jsx`):** Diğer giriş sayfalarıyla aynı split-screen tasarımına geçirildi. `useAuth` login ile yalnızca `sks_staff` yetkisine izin verildi, yetkisiz rollere özel hata eklendi ve SKS personeline özel olduğu için "Kayıt Ol" bağlantısı tamamen kaldırıldı ✔
27. **Öğrenci Kayıt Sayfası (`OgrenciKayit.jsx`):** Split-screen tasarım yapısına uygun şekilde form elemanları (Ad, E-posta, Bölüm, Sınıf, Şifre) entegre edilerek `OgrenciKayit.jsx` oluşturuldu. İstemci tarafı validasyonlar (örn. `.edu.tr` uzantısı zorunluluğu) ve `api.post('/auth/register')` bağlantısı kurularak kayıt sonrası otomatik `/ogrenci-girisi` yönlendirmesi eklendi ✔
28. **Öğrenci Kayıt Entegrasyonu (`App.jsx`):** `/ogrenci-kayit` rotası içerisindeki placeholder bileşen kaldırılarak, yeni oluşturulan `OgrenciKayit` sayfası Router'a entegre edildi ✔
29. **Öğrenci Kayıt Formu İyileştirmeleri:** `OgrenciKayit.jsx` içerisindeki Sınıf seçeneği güncellendi; "Hazırlık", "5. Sınıf" ve "6. Sınıf" seçenekleri eklendi ve seçicinin genişliği (w-full) diğer inputlarla uyumlu hale getirildi ✔
30. **Topluluk Kayıt Sayfası Arayüzü (`ToplulukKayit.jsx`):** 2 aşamalı (Hesap Bilgileri ve Kulüp Bilgileri) kayıt sürecinin görsel arayüzü kodlandı. Adım göstergeleri ve ilk aşama form validasyonları eklendi (API entegrasyonu henüz yapılmadı) ✔
31. **Topluluk Kayıt Entegrasyonu (`App.jsx`):** `/topluluk-kayit` rotası içerisindeki placeholder bileşen kaldırılarak, yeni oluşturulan `ToplulukKayit` sayfası Router'a entegre edildi ✔

---

## 🔄 Devam Edenler (In Progress)

*   `feature/auth` branch'i açık, henüz `dev`'e merge edilmedi.

---

## 🐛 Bilinen Hatalar (Known Bugs)

| # | Dosya | Hata | Durum |
|---|---|---|---|
| 1 | `AuthContext.jsx` | `/auth/login` payload’ında `username: email` kullanılıyor — backend `LoginRequest` modeli de `username` alanı bekliyor, bu nedenle **doğru** — değiştirme! | **Kapatıldı / Yanlış bug tespiti** |

---

## 🎯 Sonraki Adımlar (To-Do List)

- [x] **`/auth/login` endpoint testini tamamla**
- [x] **`feature/auth` → `dev` merge işlemi**
- [x] **`feature/clubs` branch aç** — Kulüp yönetimi API'si tamamlandı ✔
- [x] **`feature/events` branch aç** — Etkinlik yönetimi API'si tamamlandı ✔
- [x] **`feature/qr` branch aç** — Etkinlik QR kod katılım sistemi (Attendance + Certificate)
- [ ] **`feature/frontend-yeniden` başlat** — Arayüz sıfırdan yeniden yazılıyor
- [x] **SKS ayrı giriş sayfası** — `SKSLoginPage.jsx` + `/sks-login` rotası ✔
- [x] **`GET /sks/stats` endpoint** — `backend/app/routers/sks.py` oluşturuldu, `main.py`'e eklendi ✔
- [x] **SKSPanel Toplam Kullanıcı kartı** — `--` yerine gerçek `total_users` gösteriliyor ✔
- [x] **HomePage.jsx** — Ana sayfa tasarımı (LandingPage.jsx olarak tamamlandı) ✔
- [ ] **ClubsPage.jsx & ClubDetailPage.jsx** — Kulüp listesi ve detay sayfası
- [ ] **EventsPage.jsx & EventDetailPage.jsx** — Tüm etkinlikleri listeleyen sayfa ve detay sayfası
- [ ] **ClubPanel.jsx** — `club_owner` rolü için panel sayfası (`/club-panel`)
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
| `feature/frontend-yeniden` | In Progress | Frontend baştan yazılıyor, eski sayfalar silindi |

---

*Son güncelleme: 2026-05-06 (Frontend yeniden yapılandırma için temizlendi, feature/frontend-yeniden branch'ine geçildi)*
