# PROJECT_STATE - Campus Hub Beyin Dosyası

Bu dosya **Campus Hub** projesinin güncel durumunu, mimarisini ve yapılacaklar listesini (To-Do) takip etmek için oluşturulmuş bir hafıza sistemidir. **KURAL: Her işlem, biten her task veya yapılan her kritik değişiklikten sonra bu dosya otomatik olarak güncellenecektir.**

---

## 🏗️ Proje Özeti ve Mimari (Current Architecture)

**Campus Hub**, üniversite öğrenci toplulukları, kulüpler ve işletmeler için tasarlanmış kapalı devre bir SaaS (Software as a Service) projesidir.

*   **Backend:** Python + FastAPI
*   **Veritabanı (Database):** PostgreSQL 15 (Docker üzerinden)
*   **Veritabanı Yönetimi:** pgAdmin4
*   **Konteynerleştirme:** Docker & Docker Compose
*   **Frontend:** React.js (Henüz başlanmadı, sadece klasör yapısı mevcut)

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

---

## 🔄 Devam Edenler (In Progress)

*   `feature/auth` branch'i açık, henüz `dev`'e merge edilmedi.

---

## 🎯 Sonraki Adımlar (To-Do List)

- [x] **`/auth/login` endpoint testini tamamla**
- [x] **`feature/auth` → `dev` merge işlemi**
- [x] **`feature/clubs` branch aç** — Kulüp yönetimi API'si tamamlandı ✔
- [x] **`feature/events` branch aç** — Etkinlik yönetimi API'si tamamlandı ✔
- [ ] **`feature/qr` branch aç** — Etkinlik QR kod katılım sistemi (Attendance + Certificate)
- [ ] **`feature/frontend` branch aç** — React.js frontend geliştirmesi

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

---

*Son güncelleme: 2026-04-05*
