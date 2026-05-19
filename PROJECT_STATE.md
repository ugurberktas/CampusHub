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
32. **Topluluk Kayıt API Mantığı (`ToplulukKayit.jsx`):** Boş bırakılan `handleSubmit` fonksiyonu dolduruldu. Sırasıyla: kullanıcı kaydı (`/auth/register`), dönen token ile kulüp oluşturma (`/clubs`) yapılıyor; başarıda 3 saniye sonra `/topluluk-girisi`ne yönlendiriliyor, hatalarda backend mesajı form üzerinde gösteriliyor ✔
33. **Topluluk Kayıt Rol Alanı (`ToplulukKayit.jsx`):** `handleSubmit` içerisindeki `/auth/register` istek gövdesine `role: 'club_owner'` alanı eklendi — kulüp başkanları artık kayıt sırasında doğru rolle oluşturuluyor ✔
34. **AuthContext Login Düzeltmesi (`AuthContext.jsx`):** Login fonksiyonu güncellendi. Token alındıktan sonra `GET /auth/me` çağrısıyla gerçek kullanıcı objesi (id, email, role vb.) alınıp localStorage ve state'e kaydediliyor — artık token response objesi değil, gerçek kullanıcı bilgisi saklanıyor ✔
35. **Salonlar ve Rezervasyonlar API (`backend/app/routers/salons.py`):** `salons.py` router'ı oluşturularak `GET /salons` ve `POST /salon_reservations` endpoint'leri eklendi ve `backend/main.py`'e dahil edildi ✔
36. **StudentDashboard.jsx:** layout skeleton ✅
37. **ClubDashboard.jsx:** pending status check skeleton ✅
38. **ClubDashboard.jsx (Etkinlik Oluşturma Geliştirmesi):** Etkinlik oluşturma formuna salon seçimi (dropdown) ve afiş (image URL) girdileri eklendi; salon seçildiğinde otomatik olarak `POST /salon_reservations` çağrısı yapılması sağlandı ✔
39. **Görsel Yükleme Servisi (`backend/app/routers/upload.py`):** `upload.py` router'ı oluşturularak `POST /upload` endpoint'i eklendi (5MB boyut ve resim uzantısı doğrulama mantığı dahil) ve `backend/main.py` içerisine statik dosya sunum alanı (`/static`) ile birlikte entegre edildi ✔
40. **ClubDashboard.jsx (Dosya Yükleme Entegrasyonu):** Etkinlik afişi alanı için olan metin girdisi, gerçek dosya yükleme (`POST /upload` üzerinden) ve yüklenen resim için canlı önizleme sunan dosya girdisi (`input type="file"`) ile değiştirildi ✔
41. **ClubDashboard.jsx (EventCreate Şema Uyumluluğu):** `handleCreateEvent` içerisindeki `/events` istek gövdesi backend tarafındaki `EventCreate` Pydantic şeması ile tam uyumlu hale getirildi (start_time yerine event_date kullanıldı, expected_attendance_rate eklendi, gereksiz image_url ve end_time alanları çıkarıldı) ✔
42. **ClubMemberResponse Şema Düzeltmesi (`backend/app/schemas.py`):** Üye listeleme endpoint'inde (`GET /clubs/{club_id}/members`) oluşan ResponseValidationError hatasını önlemek için `joined_at` alanı `datetime | None = None` olarak isteğe bağlı (optional) hale getirildi ✔
43. **Salon Rezervasyon API Hata Düzeltmesi (`backend/app/routers/salons.py`):** `POST /salon_reservations` endpoint'inde oluşan `ResponseValidationError` hatasını gidermek için: `ReservationResponse` şemasındaki `reservation_date` alanı `date | None = None` (tarih objesi) olarak güncellendi ve nesne oluşturulurken gelen değer string'e dönüştürüldü ✔
44. **ClubDashboard.jsx (Etkinlik ve Üye Kartları Tasarım Düzeltmesi):** Etkinlik kartlarında yeni `event_date` alanı formatlanarak gösterildi, afiş resmi (`image_url`) varsa kartın üst kısmında gösterilecek şekilde düzenlendi; üye listesindeki avatar ve isim gösterimi fallback mantıklarıyla güçlendirildi (`member.full_name || 'İsimsiz Üye'`) ✔
45. **StudentDashboard.jsx (Etkinlik Akışı ve Kayıt):** Öğrenci panelinin orta sütunundaki boş durum, `GET /events` üzerinden gelen dinamik etkinlik akışı ile değiştirildi; afiş görseli desteği, tarih/konum formatlaması ve `POST /events/{id}/register` üzerinden çalışan "Kayıt Ol" butonu eklendi ✔
46. **StudentDashboard.jsx (Kayıt Durumu ve Buton İyileştirmesi):** Öğrenci panelinde kayıt durumunu takip etmek için `registeredEvents` state'i eklendi; kayıtlı olunan etkinlikler için buton pasif ve yeşil renkli ("✓ Kayıtlısınız") olarak render edilecek şekilde güncellendi ✔
47. **ClubDashboard.jsx (Etkinlik Yönetimi ve Kayıt Listesi):** Kulüp panelindeki etkinlik kartları; düzenleme, silme (`DELETE /events/{id}`) ve kayıt olanları görme özellikleri barındıracak şekilde yeniden tasarlandı. Ayrıca kayıtlı öğrencileri profil resimleri ve bölümleriyle listeleyen bir modal bileşeni entegre edildi ✔
48. **Etkinlik Silme API Entegrasyonu (`backend/app/routers/events.py`):** Etkinlik silme esnasında oluşan yabancı anahtar kısıtlaması hatasını (`ForeignKeyViolation`) engellemek için, `delete_event` endpoint'inde öncelikle etkinliğe ait tüm kayıt verilerinin (`EventRegistration`) silinmesi, ardından etkinliğin veritabanından kaldırılması sağlandı ✔
49. **ClubDashboard.jsx (Etkinlik Düzenleme Modalı Entegrasyonu):** Kulüp panelindeki etkinlikleri düzenlemek amacıyla, form alanlarını ve `PUT /events/{id}` API çağrısını tetikleyen bir düzenleme modalı (`editingEvent` state'i ile kontrol edilen) entegre edildi ✔
50. **Etkinlik Güncelleme API Entegrasyonu (`backend/app/routers/events.py`):** Etkinliği düzenleme modalinden gelen verileri karşılayacak şekilde, kulüp yetkilisi/yöneticisi kontrolü içeren `PUT /events/{event_id}` endpoint'i (`update_event`) backend API'ye eklendi ✔
51. **ClubDashboard.jsx (Düzenleme Verisi Şema Güncellemesi):** `handleEditEvent` içerisindeki `PUT /events/{id}` istek gövdesi güncellenerek, backend tarafındaki `EventCreate` (veya `update_event` için beklenen) şemasıyla uyumlu olacak şekilde `expected_attendance_rate` alanı eklendi ve `capacity` alanı integer türüne dönüştürüldü ✔
52. **ClubDashboard.jsx (Etkinlik Düzenleme İstek Gövdesi):** `handleEditEvent` içerisindeki `PUT /events/{id}` istek gövdesine `club_id` eklendi, `description` alanı boşsa default olarak boş string (`''`) gönderilecek şekilde düzenlendi ✔
53. **Kulüp Üyeleri Listeleme API Entegrasyonu (`backend/app/routers/clubs.py`):** `GET /clubs/{club_id}/members` endpoint'i (`list_members`), `club_members` tablosunu `users` tablosuyla birleştirip (`join`) kullanıcıların tam adı (`full_name`), bölümü (`department`) ve sınıfı (`grade`) gibi profil bilgilerini de içerecek şekilde güncellendi; response_model kısıtlaması dekoderden kaldırıldı ✔
54. **EventResponse Şema Güncellemesi (`backend/app/schemas.py`):** `EventResponse` Pydantic modelindeki `created_at` alanı `datetime | None = None` olarak güncellendi. Bu sayede veritabanından `created_at` değeri null (veya atanmamış) dönen eski/yeni etkinlikler için validation hatası verilmesi engellendi ✔
55. **StudentDashboard.jsx (Dinamik Önerilen Topluluklar Akışı):** Sağ sütundaki statik topluluk şablonları kaldırıldı; `GET /clubs` endpoint'inden dönen kulüpler listesinden ilk 5 tanesini ("Önerilen Topluluklar") dinamik olarak listelemek için `clubs` state'i ve ilgili `useEffect` sorgusu entegre edildi ✔
56. **ClubResponse Şema Güncellemesi (`backend/app/schemas.py`):** `ClubResponse` Pydantic modelindeki `created_at` alanı `datetime | None = None` olarak güncellendi. Bu sayede veritabanından `created_at` değeri null dönen veya atanmamış olan kulüpler için validation hatası verilmesi engellendi ✔
57. **StudentDashboard.jsx (Önerilen Topluluklar Sıralama Güncellemesi):** `fetchClubs` içerisindeki `clubsRes.data` dilimleme mantığı `slice(-5).reverse()` olarak güncellendi. Bu sayede sisteme en son eklenen 5 topluluğun tersten sıralanarak en üstte yer alması sağlandı ✔
58. **StudentDashboard.jsx (Topluluğa Üye Ol Butonu Entegrasyonu):** Önerilen topluluklar listesindeki her bir satıra `handleJoinClub` API post işlevini tetikleyen bir "Üye Ol" butonu eklendi; üye olunan topluluklar `joinedClubs` state'i üzerinden yeşil renkli "✓ Üye" rozetine dönüştürülecek şekilde güncellendi ✔
59. **Topluluğa Katılma API Entegrasyonu (`backend/app/routers/clubs.py`):** Öğrenci kullanıcılarının topluluklara doğrudan katılması için, herhangi bir istek gövdesi (payload) gerektirmeyen `POST /clubs/{club_id}/join` endpoint'i (`join_club`) sisteme eklendi ✔
60. **StudentDashboard.jsx (Topluluğa Katılma API Çağrısı Güncellemesi):** `handleJoinClub` fonksiyonundaki API katılım endpoint'i `POST /clubs/{clubId}/members` yerine `POST /clubs/{clubId}/join` olarak güncellendi ✔
61. **Öğrenci Profili API Entegrasyonu (`backend/app/routers/auth.py`):** Öğrencilerin kendi katıldıkları toplulukları listelemek için `GET /auth/me/clubs` ve kayıtlı oldukları etkinlikleri listelemek için `GET /auth/me/events` endpoint'leri auth router'ına eklendi; gerekli model ve `Annotated` tip tanımları import edildi ✔
62. **Topluluktan Ayrılma API Entegrasyonu (`backend/app/routers/clubs.py`):** Öğrencilerin katıldıkları topluluklardan ayrılabilmeleri için `DELETE /clubs/{club_id}/leave` endpoint'i (`leave_club`) sisteme eklendi; kulüp sahiplerinin kulüpten ayrılması engellendi ✔
63. **Etkinlik Kaydı İptali API Entegrasyonu (`backend/app/routers/events.py`):** Öğrencilerin kaydoldukları etkinliklerden kayıtlarını iptal edebilmeleri için `DELETE /events/{event_id}/unregister` endpoint'i (`unregister_from_event`) sisteme eklendi ✔
64. **Öğrenci Profil Sayfası Şablonu (`frontend/src/pages/ProfilePage.jsx`):** Öğrencilerin katıldıkları toplulukları ve etkinlikleri görüntüleyebilecekleri profil sayfasının (`ProfilePage.jsx`) iskeleti, yönlendirme butonu ve `GET /auth/me/events`, `GET /auth/me/clubs` API istekleriyle birlikte oluşturuldu ✔
65. **Uygulama Yönlendirme Ayarları (`frontend/src/App.jsx`):** Profil sayfası (`ProfilePage`) içe aktarıldı (import) ve `/profile` path'i öğrenci rolü (`student`) kısıtlaması altında `PrivateRoute` ile Route tablosuna dahil edildi ✔
66. **Profil Sayfası Sol Kolon Entegrasyonu (`frontend/src/pages/ProfilePage.jsx`):** Sol kolon yer tutucu (placeholder) alanı; avatar, isim, bölüm, sınıf, e-posta, kayıtlı olunan topluluk ve etkinlik sayılarını dinamik olarak gösteren detaylı bir profil kartı ile değiştirildi ✔
67. **Profil Sayfası Sağ Kolon Entegrasyonu (`frontend/src/pages/ProfilePage.jsx`):** Sağ kolon yer tutucu alanı; "Etkinliklerim" ve "Topluluklarım" sekmelerinden oluşan, etkinlik kaydı iptal etme (`unregister`) ve topluluktan ayrılma (`leave`) API eylemlerine sahip dinamik liste sekmeleriyle güncellendi ✔
68. **StudentDashboard.jsx (Profil Yönlendirme Entegrasyonu):** Kullanıcı menüsündeki "Profilim" butonuna tıklandığında `/profile` sayfasına yönlendirme yapabilmesi için `useNavigate` hook'u içe aktarıldı ve `onClick={() => navigate('/profile')}` tetikleyicisi bu butona eklendi ✔
69. **StudentDashboard.jsx (Etkinlik Kaydı Kontenjan Denetimi):** Etkinlik listesindeki "Kayıt Ol" butonu; eğer etkinlik kontenjanı dolmuşsa (`event.registration_count >= event.capacity`) pasif (disabled) hale getirilip "Kontenjan Doldu" yazısı gösterecek şekilde IIFE yapısıyla güncellendi ✔
70. **StudentDashboard.jsx (Etkinlik Kartı Tasarım Güncellemesi):** Etkinlik kartları; kulüp bilgisi (kulüp ismi, logo baş harfi ve tarih) içeren bir başlık alanı, kenardan kenara görsel (varsayıaran degrade görsel dahil), başlık, kapasite oranı, açıklama, konum/saat bilgileri ve sosyal kanıt (öğrenci katılım sayısı) içeren LinkedIn/Instagram benzeri modern bir tasarıma kavuşturuldu ✔
71. **StudentDashboard.jsx (Etkinlik Kartlarında Gerçek Kulüp Adı Gösterimi):** Etkinlik kartı başlığında yer alan kulüp adı ve profil baş harfi, API'den gelen `clubs` state dizisi taranarak `event.club_id` ile eşleşen kulübün adı (`clubs.find(c => c.id === event.club_id)?.name`) ile dinamik hale getirildi ✔

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
