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
4.  **Auth Sistemi (`feature/auth` branch):**
    *   `POST /auth/register` — Çalışıyor, başarıyla test edildi ✔
    *   `POST /auth/login` — Implement edildi
    *   `GET /auth/me` — Implement edildi
    *   `.edu.tr` e-posta doğrulaması aktif
    *   `student_no` e-postadan otomatik çıkarılıyor
    *   JWT token sistemi kuruldu
    *   Rol sistemi mevcut: `student`, `club_owner`, `core_team`, `sks`
    *   Üniversite, kayıt sırasında mevcut değilse otomatik oluşturuluyor

---

## 🔄 Devam Edenler (In Progress)

*   `feature/auth` branch'i açık, henüz `dev`'e merge edilmedi.

---

## 🎯 Sonraki Adımlar (To-Do List)

- [ ] **`/auth/login` endpoint testini tamamla**
- [ ] **`feature/auth` → `dev` merge işlemi**
- [ ] **`feature/clubs` branch aç** — Kulüp yönetimi API'si
- [ ] **`feature/events` branch aç** — Event + QR sistemi
- [ ] **`feature/frontend` branch aç** — React.js frontend geliştirmesi

---

## 🌿 Branch Stratejisi (Branch Strategy)

| Branch | Durum | Açıklama |
|---|---|---|
| `main` | Aktif | Kararlı (stable) kod |
| `dev` | Aktif | Ana geliştirme ortamı |
| `feature/database-models` | Merged | `dev`'e merge edildi ✔ |
| `feature/auth` | In Progress | Devam ediyor, merge bekliyor |

---

*Son güncelleme: 2026-04-05*
