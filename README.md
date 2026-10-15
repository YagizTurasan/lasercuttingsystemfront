# Laser Cutting System — Frontend (LaserCode Pro)

Lazer kesim makineleri için hata kodu ve arıza çözüm platformunun web arayüzü.
Kullanıcılar makinelerini seçer, hata kodlarını arar, çözümleri görüntüler ve aboneliklerini yönetir.
Adminler kullanıcıları, makineleri (model/bölüm/parça hiyerarşisiyle) ve hata kodlarını yönetir; hata kodlarını Excel'den toplu yükleyebilir.

| Depo | İçerik |
|---|---|
| [lasercuttingsystem](https://github.com/YagizTurasan/lasercuttingsystem) | Backend — .NET 9 Web API |
| **[lasercuttingsystemfront](https://github.com/YagizTurasan/lasercuttingsystemfront)** (bu depo) | Frontend — React + Vite |

---

## İçindekiler
- [Teknolojiler](#teknolojiler)
- [Kurulum ve çalıştırma](#kurulum-ve-çalıştırma)
- [Ortam değişkenleri](#ortam-değişkenleri)
- [Proje yapısı](#proje-yapısı)
- [Sayfalar ve rotalar](#sayfalar-ve-rotalar)
- [Admin araçları](#admin-araçları)
- [Backend ile iletişim](#backend-ile-iletişim)
- [Kimlik doğrulama akışı](#kimlik-doğrulama-akışı)
- [Tema](#tema)
- [Kod kalitesi](#kod-kalitesi)

---

## Teknolojiler

| Alan | Kullanılan |
|---|---|
| Framework | React 19 + TypeScript 5.8 |
| Derleme | Vite 7 |
| UI | Ant Design 5 (Türkçe locale `tr_TR`), `@ant-design/icons` |
| Yönlendirme | React Router 7 |
| Durum | Zustand (oturum durumu: `src/hooks/useAuth.ts`) |
| HTTP | `fetch` tabanlı kendi `HttpClient` sınıfı (`src/lib/http-client.ts`) |

---

## Kurulum ve çalıştırma

### Gereksinimler
- Node.js 20+ ve npm
- Çalışan backend API (`https://localhost:7206`). Kurulum için [backend README](https://github.com/YagizTurasan/lasercuttingsystem#kurulum-ve-çalıştırma)'sine bakın.

### Adımlar
```bash
git clone https://github.com/YagizTurasan/lasercuttingsystemfront.git
cd lasercuttingsystemfront
npm install
npm run dev        # http://localhost:3000
```

İki projeyi birlikte ayağa kaldırma adımları backend README'sindeki
[Frontend ile birlikte çalıştırma](https://github.com/YagizTurasan/lasercuttingsystem#frontend-ile-birlikte-çalıştırma) bölümündedir.

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu (port **3000**, ağdan erişilebilir: `host: true`) |
| `npm run build` | Tip kontrolü (`tsc -b`) + üretim derlemesi → `dist/` |
| `npm run preview` | Derlenmiş çıktıyı önizle |
| `npm run lint` | ESLint |

Geliştirmede tarayıcı yalnızca `http://localhost:3000` ile konuşur. `/api` ile başlayan istekler Vite proxy'si tarafından backend'e iletilir.
Bu yüzden ayrıca CORS veya sertifika ayarı gerekmez; proxy backend'in self-signed sertifikasını kabul eder (`secure: false`).

### İlk giriş
Backend geliştirme ortamında ilk açılışta bir admin hesabı oluşturur: **`admin@lasercutting.com` / `Admin123!`**.
Canlı ortamda admin şifresi backend yapılandırmasından (`SeedAdmin:Password`) verilir.
Admin rolündeki kullanıcı girişten sonra doğrudan `/admin/dashboard` sayfasına yönlendirilir.
Kullanıcı panelindeyken sağ üstteki kullanıcı menüsünden **Admin Paneli** seçeneğiyle de geçebilir.

---

## Ortam değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın (`.env` git'e eklenmez).

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `VITE_API_URL` | `/api` | API kök adresi. Varsayılan değer, geliştirmede Vite proxy'sini kullanır. |
| `VITE_API_PROXY_TARGET` | `https://localhost:7206` | `npm run dev` sırasında `/api` isteklerinin yönlendirileceği backend adresi |

> **Canlı ortam:** Refresh token cookie'si `SameSite=Strict` olduğu için frontend ve API **aynı site** altında sunulmalıdır.
> Örneğin aynı alan adında `/` → frontend, `/api` → backend (reverse proxy).
> Farklı bir origin kullanılırsa backend'deki `Cors:AllowedOrigins` listesine frontend adresi eklenmelidir.

---

## Proje yapısı

```
src/
├── main.tsx                 # Giriş noktası (bazı antd uyarılarını konsolda gizler)
├── App.tsx                  # Rotalar (React.lazy ile bölünmüş), iki tema, açılışta oturum geri yükleme
├── lib/
│   ├── config.ts            # API_CONFIG: BASE_URL (VITE_API_URL) ve endpoint yolları
│   └── http-client.ts       # fetch sarmalayıcı: bellekte access token, cookie ile refresh, timeout, dosya yükleme
├── services/                # API çağrıları (sınıf + singleton)
│   ├── auth.service.ts      # Giriş/çıkış, oturum geri yükleme, kullanıcı bilgisi
│   ├── subscription.service.ts
│   ├── dashboard.service.ts # Dashboard istatistiklerini birkaç uçtan birleştirir
│   └── admin.service.ts     # Admin uçları: kullanıcı, makine hiyerarşisi, hata kodu, Excel import
├── hooks/
│   ├── useAuth.ts           # Zustand oturum store'u (tüm bileşenler aynı durumu paylaşır)
│   ├── useSubscription.ts
│   └── useAdmin.ts          # Admin sayfaları için veri hook'ları
├── components/
│   ├── LoginForm.tsx, RegisterForm.tsx, ForgotPasswordForm.tsx
│   ├── AuthPageShell.tsx    # Şifre sıfırlama / e-posta doğrulama sayfalarının ortak çerçevesi
│   ├── ProtectedRoute.tsx   # Giriş kontrolü; requireAdmin ile Admin rolü kontrolü
│   ├── admin/
│   │   ├── MachineHierarchyDrawer.tsx  # Model / bölüm / parça yönetimi, silinenleri geri getirme
│   │   └── ExcelImportModal.tsx        # Excel şablonu indirme ve hata kodu içe aktarma
│   └── layout/
│       ├── AppLayout.tsx    # Kullanıcı paneli: yan menü + üst bar
│       └── AdminLayout.tsx  # Admin paneli: yan menü + üst bar
├── pages/
│   ├── HomePage.tsx         # Tanıtım (landing) sayfası
│   ├── LoginPage.tsx, RegisterPage.tsx, ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx, VerifyEmailPage.tsx   # E-postadaki bağlantıların açtığı sayfalar
│   ├── DashboardPage.tsx, ProfilePage.tsx
│   ├── machines/MachinesPage.tsx
│   ├── error-codes/ErrorCodesPage.tsx, ErrorCodeDetailPage.tsx
│   ├── subscription/SubscriptionPlansPage.tsx, CurrentSubscriptionPage.tsx, PaymentHistoryPage.tsx
│   └── admin/AdminDashboardPage.tsx, AdminUserPage.tsx, AdminMachinePage.tsx, AdminErrorCodesPage.tsx
├── types/api.ts             # Backend DTO'larının TypeScript karşılıkları
└── css/                     # Landing ve auth sayfalarının stilleri
```

Vite'ta `@` takma adı `src/` klasörünü gösterir (`@/lib/config` gibi).

### Paketleme
Her sayfa `React.lazy` ile ayrı bir chunk'a bölünür ve yalnızca ziyaret edildiğinde indirilir.
Kütüphaneler ayrı chunk'lardadır (`vendor`, `router`, `antd`, `icons`); uygulama kodu değişse de tarayıcı önbelleğinde kalırlar.
Ana uygulama paketi ~200 kB; en büyük parça antd'dir (~1 MB, gzip ~316 kB).

---

## Sayfalar ve rotalar

### Herkese açık (koyu tema)
| Rota | Sayfa | Açıklama |
|---|---|---|
| `/` | HomePage | Tanıtım, özellikler, paket fiyatları |
| `/login` | LoginPage | Giriş; admin ise `/admin/dashboard`, değilse `/dashboard` |
| `/register` | RegisterPage | Kayıt |
| `/forgot-password` | ForgotPasswordPage | Şifre sıfırlama bağlantısı iste |
| `/reset-password?email=…&token=…` | ResetPasswordPage | E-postadaki bağlantıyla yeni şifre belirle (bağlantı 1 saat geçerli, tek kullanımlık) |
| `/verify-email?email=…&token=…` | VerifyEmailPage | E-postadaki bağlantıyla adresi doğrula; başarısızsa yeni bağlantı istenebilir |

### Kullanıcı paneli (`AppLayout`, açık tema)
| Rota | Sayfa | Açıklama |
|---|---|---|
| `/dashboard` | DashboardPage | Seçili makine sayısı, erişilebilir ve ücretsiz kod sayısı, plan durumu |
| `/machines` | MachinesPage | Makine listesi, seçme ve seçimi kaldırma |
| `/error-codes` | ErrorCodesPage | Sayfalı arama, erişim seviyesine göre filtre |
| `/error-codes/:id` | ErrorCodeDetailPage | Açıklama, çözüm, hiyerarşi |
| `/subscription` | SubscriptionPlansPage | Planlar ve abone olma (demo ödeme, gerçek tahsilat yapılmaz) |
| `/subscription/current` | CurrentSubscriptionPage | Aktif abonelik, iptal ve yenileme |
| `/subscription/payments` | PaymentHistoryPage | Ödeme geçmişi (demo ödeme kayıtları) |
| `/profile` | ProfilePage | Profil bilgileri, güncelleme, şifre değiştirme |

### Admin paneli (`AdminLayout`)
| Rota | Sayfa | Açıklama |
|---|---|---|
| `/admin/dashboard` | AdminDashboardPage | Özet, abonelik ve gelir istatistikleri, son aktiviteler |
| `/admin/users` | AdminUsersPage | Kullanıcı arama, oluşturma, düzenleme, rol ve abonelik atama, şifre sıfırlama |
| `/admin/machines` | AdminMachinesPage | Makine CRUD, model / bölüm / parça yönetimi |
| `/admin/error-codes` | AdminErrorCodesPage | Hata kodu CRUD, Excel'den içe aktarma |

Bilinmeyen rotalar `/` adresine yönlendirilir.

**Rota koruması** (`App.tsx` → `UserRoute` / `AdminRoute`):
- Kullanıcı ve admin paneli rotaları `ProtectedRoute` ile sarılıdır; giriş yapılmamışsa `/login` sayfasına yönlendirilir.
- Admin rotaları ayrıca `role === 'Admin'` kontrolü yapar; admin olmayan kullanıcı `/dashboard` sayfasına gönderilir.
- Rol bilgisi giriş yanıtından (`user.role`) veya sayfa yenilendiğinde `GET /api/Users/profile` yanıtındaki `roles` listesinden gelir.
  Bu kontrol yalnızca arayüz içindir; asıl yetki kontrolü backend'dedir (`[Authorize(Roles = "Admin")]`).

---

## Admin araçları

### Model / Bölüm / Parça yönetimi
**Admin → Makineler** sayfasında bir makinenin `⋯` menüsünden **Model / Bölüm / Parça** seçilir.
Açılan çekmecede hiyerarşi ağaç olarak gösterilir:

```
Makine (marka)
 └── Model
      └── Bölüm
           └── Parça
```

- **Model Ekle** düğmesi (sağ üst) makineye yeni model ekler.
- Her düğümde `+` ile bir alt seviye eklenir, kalem ile düzenlenir, çöp kutusu ile silinir.
- Alt seviyeler düğüm ilk açıldığında yüklenir.
- Silme işlemi soft delete'tir (`IsActive = false`). Alt seviyeyi de etkiler:

  | Silinen | Şunu da siler |
  |---|---|
  | Model | Bölümleri |
  | Bölüm | Parçaları |
  | Parça | Parçaya bağlı hata kodları |

- **Silinenleri göster** anahtarı açılınca silinmiş öğeler soluk ve üstü çizili olarak, "Silindi" etiketiyle listelenir.
  **Geri getir** düğmesi öğeyi ve silmenin kapattığı alt öğeleri yeniden açar.

### Excel'den hata kodu içe aktarma
**Admin → Hata Kodları** sayfasında **Excel'den İçe Aktar** düğmesi.
1. Pencerede beklenen sütun sırası gösterilir. **Şablonu İndir** ile doğru başlıklara ve örnek bir satıra sahip `hata-kodlari-sablon.xlsx` dosyası indirilebilir.
2. `.xlsx` veya `.xls` dosyası sürüklenip bırakılır ya da seçilir, sonra **İçe Aktar** ile gönderilir.
3. İşlem sonunda başarılı ve başarısız satır sayısı ile satır bazlı hata mesajları listelenir.

Sütunların ayrıntıları backend README'sindeki [Excel ile toplu hata kodu yükleme](https://github.com/YagizTurasan/lasercuttingsystem#excel-ile-toplu-hata-kodu-yükleme) bölümündedir.

---

## Backend ile iletişim

- API adresi tek yerde tanımlıdır: `src/lib/config.ts` → `API_CONFIG.BASE_URL` (`VITE_API_URL`, varsayılan `/api`).
- Kullanıcı tarafı endpoint'leri `API_CONFIG.ENDPOINTS` içinde, admin endpoint'leri `admin.service.ts` içinde tanımlıdır.
- `HttpClient`:
  - Her isteğe bellekteki access token'ı `Authorization: Bearer <token>` olarak ekler.
  - İstekleri `credentials: 'include'` ile gönderir; refresh token cookie'si bu sayede taşınır.
  - 10 saniyelik timeout uygular.
  - 401 alınırsa token'ı cookie ile bir kez yeniler ve isteği tekrarlar. Aynı anda gelen 401'ler tek bir yenileme isteğini paylaşır.
  - Yenileme de başarısız olursa oturumu kapatır; `ProtectedRoute` kullanıcıyı `/login` sayfasına yönlendirir.
  - Dosya yüklemek için `upload(endpoint, formData)`, dosya indirmek için `download(endpoint)` metodunu sunar.
  - Herkese açık uçlarda (giriş, kayıt, şifre sıfırlama, e-posta doğrulama) 401 alınırsa token yenileme denenmez.
  - Hataları `{ message, status, errors }` biçimine çevirir; JSON olmayan hata yanıtlarını da okur.
  - Bileşenlerde hata mesajı için `getErrorMessage(err, 'Varsayılan mesaj')` yardımcısı kullanılabilir.

---

## Kimlik doğrulama akışı

Token'lar **`localStorage`'da tutulmaz**. XSS ile çalışan bir script'in token'ları kalıcı depodan çalmasını önlemek için:

| Token | Nerede | Ömür |
|---|---|---|
| Access token | Yalnızca bellekte (`HttpClient` içinde) | 15 dk |
| Refresh token | `HttpOnly; Secure; SameSite=Strict` cookie (`lcs_refresh_token`, path `/api/Auth`); JavaScript okuyamaz | 7 gün |

1. **Giriş:** `LoginForm` → `useAuth().login` → `POST /api/Auth/login`.
   Backend refresh token'ı cookie olarak ayarlar; yanıt gövdesinde yalnızca access token ve kullanıcı bilgisi döner.
2. **İstekler:** Access token her isteğe eklenir. Süresi dolunca `POST /api/Auth/refresh-token` (gövdesiz, cookie ile) çağrılır.
   Backend refresh token'ı her kullanımda yeniler (rotasyon).
3. **Sayfa yenileme:** Bellek sıfırlandığı için `App` açılışta `useAuth().initialize()` çağırır.
   Bu çağrı cookie ile yeni bir access token alır ve `GET /api/Users/profile` ile kullanıcıyı yükler.
   Bu sırada korumalı sayfalarda yükleniyor göstergesi görünür.
4. **Çıkış:** `POST /api/Auth/logout`. Backend refresh token'ı iptal eder ve cookie'yi siler; bellekteki access token temizlenir.

`useAuth` bir Zustand store'udur; tüm bileşenler aynı oturum durumunu paylaşır.

### Şifre sıfırlama ve e-posta doğrulama
1. `/forgot-password` sayfası `POST /api/Auth/forgot-password` çağırır.
2. Backend bir sıfırlama bağlantısı e-postalar: `/reset-password?email=…&token=…`.
3. `ResetPasswordPage` bu bağlantıdaki token ile `POST /api/Auth/reset-password` çağırır. Başarılı olunca diğer tüm oturumlar kapatılır.

`VerifyEmailPage` de aynı şekilde `/verify-email` bağlantısıyla açılır ve `POST /api/Auth/verify-email` çağırır.
Bağlantı geçersizse sayfadan yeni bir doğrulama e-postası istenebilir.

> Backend'de SMTP yapılandırılmamışsa geliştirme ortamında e-posta gönderilmez; bağlantılar backend konsoluna yazılır.
> Bkz. [backend README → E-posta](https://github.com/YagizTurasan/lasercuttingsystem#e-posta).

---

## Tema

`App.tsx` içinde iki Ant Design teması tanımlıdır:
- **authTheme:** Landing ve giriş sayfaları için koyu tema, ana renk `#00d4ff`.
- **appTheme:** Kullanıcı ve admin panelleri için açık tema, ana renk `#1890ff`.

---

## Kod kalitesi

- `npm run lint` hatasız geçer.
- `npm run build` önce `tsc -b` ile tip kontrolü yapar.
- **Hata yakalama:** `catch (err: any)` yerine `catch (err)` ve `getErrorMessage(err, '…')` kullanılır.
- **İlk açılışta yükleme:** Yalnızca ilk açılışta veri yükleyen sayfalardaki `useEffect`'ler `react-hooks/exhaustive-deps` kuralından gerekçesiyle muaf tutulmuştur.
  Bu sayfalardaki yükleme fonksiyonları her render'da yeniden oluştuğu için bağımlılık olarak eklenirlerse sonsuz döngüye girer.
