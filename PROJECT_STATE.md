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

### 📌 Mevcut Kaynaklar ve İlerleyiş (Current State)
1.  **Konteyner ve Ortam (Docker & Env):**
    *   `docker-compose.yml` tamamlandı. `db` (Postgres), `pgadmin` ve `backend` servisleri birbirine bağlandı.
    *   Backend, `depends_on: db` kuralıyla çalışıyor. 
    *   Gerekli ortam değişkenleri (`.env` ve `.env.example`) tanımlandı.
2.  **Backend Altyapısı (FastAPI):**
    *   `main.py` oluşturuldu. `startup` event'ine veritabanı bağlantısı kopsa bile 5 defa tekrarlamasına (retry mekanizması) olanak sağlayan dayanıklı bir mimari eklendi.
    *   `/health` kontrol endpoint'i aktif.
    *   `app/database.py` içine SQLAlchemy ayarları, `engine`, `SessionLocal` ve `get_db` dependency fonksiyonları eklendi.
    *   `app/models.py` ve `app/schemas.py` dosyaları oluşturulmuş durumda, veritabanı tabloları modelleniyor.
    *   `app/routers/auth.py` ile yetkilendirme (Authentication) süreçlerinin temelleri atıldı.
3.  **Frontend:** 
    *   `frontend/` klasörü şimdilik `.gitkeep` ile yer tutucu olarak bekliyor.

---

## 🎯 Sonraki Adımlar (To-Do List)

- [ ] **Alembic Kurulumu ve Migration:** Veritabanı tablolarını güvenli bir şekilde yönetmek için Alembic (migration) yapılandırılmalı.
- [ ] **Backend İş Mantığı:** Auth (Yetkilendirme) endpoint'lerinin (`/login`, `/register`) test edilmesi ve eksiklerin tamamlanması.
- [ ] **Frontend Mimarisi:** React.js veya Next.js kurularak temel sayfa yapılarının ve routing (Authentication Guard vb.) işlemlerinin kodlanmaya başlanması.
- [ ] **Ortak API İletişimi:** Backend'in ayağa kalktığında Swagger UI üzerinden dış API tüketimi testlerinin yapılması.

---

*Son güncelleme tarihi dosyaya işlenen commit'lere/kayıtlara göre takip edilecektir.*
