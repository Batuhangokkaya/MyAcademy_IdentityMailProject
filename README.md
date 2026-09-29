# 📧 B-Mail — ASP.NET Core Mesajlaşma Sistemi

B-Mail, **ASP.NET Core 8.0 MVC** kullanılarak geliştirilmiş, kullanıcıların sistem içerisindeki diğer kullanıcılarla mesajlaşabildiği web tabanlı bir mesajlaşma uygulamasıdır.

Proje kapsamında mesajlaşma işlemlerinin yanı sıra kimlik doğrulama, profil yönetimi, kategoriler, taslaklar, bildirimler, rol yönetimi, mesaj şikayet sistemi ve istatistik ekranı gibi birçok özellik geliştirilmiştir.

## 🚀 Kullanılan Teknolojiler

- ASP.NET Core 8.0 MVC
- C#
- Entity Framework Core
- ASP.NET Core Identity
- Microsoft SQL Server
- LINQ
- Razor
- HTML5
- CSS3
- JavaScript
- Code First yaklaşımı
- Role Based Authorization

## 🔐 Kimlik Doğrulama ve Kullanıcı İşlemleri

- Kullanıcı kayıt ve giriş sistemi
- ASP.NET Core Identity altyapısı
- Rol bazlı yetkilendirme
- Profil görüntüleme ve düzenleme
- Ad ve soyad güncelleme
- Profil fotoğrafı güncelleme
- Şifre değiştirme
- Şifremi Unuttum / Şifre Sıfırlama
- E-posta doğrulama
- Aynı e-posta adresiyle birden fazla hesap oluşturulmasının engellenmesi
- Yetkisiz kullanıcıların mesaj ekranlarına erişiminin engellenmesi

## ✉️ Mesajlaşma Sistemi

- Yeni mesaj oluşturma ve gönderme
- Alıcı, konu ve mesaj içeriği alanları
- Yalnızca kayıtlı kullanıcılara mesaj gönderimi
- Gelen Kutusu
- Gönderilen Mesajlar
- Mesaj detay ekranı
- Mesaj yanıtlama
- Mesaj iletme
- Mesaj açıldığında otomatik okundu bilgisi
- Gönderilen mesajlarda okunma durumunun görüntülenmesi
- Mesajları önemli olarak işaretleme
- Toplu mesaj işlemleri
- Mesaj silme ve Çöp Kutusuna taşıma
- Çöp Kutusundan mesaj geri yükleme
- Çöp Kutusunu boşaltma
- Mesajları kategorilere atama

## 📂 Mesaj Kutuları

B-Mail içerisinde mesajların farklı durumlarda yönetilebilmesi için aşağıdaki bölümler bulunmaktadır:

- Gelen Kutusu
- Gönderilenler
- Taslaklar
- Önemli Mesajlar
- Çöp Kutusu
- Kategoriler

## 📝 Taslak Sistemi

- Mesajı taslak olarak kaydetme
- Taslakları listeleme
- Mevcut taslağı düzenleme
- Taslağı gönderme
- Taslak silme
- Alıcısı olan / olmayan taslakları filtreleme
- Konusu olan / olmayan taslakları filtreleme
- Taslakları yeni / eski olarak sıralama

## ⭐ Önemli Mesajlar

- Mesajları yıldız ile önemli olarak işaretleme
- Önem işaretini kaldırma
- Önemli mesajları ayrı ekranda görüntüleme
- Birden fazla mesaj üzerinde toplu işlem yapma
- Okunan / okunmayan önemli mesajları filtreleme
- Kategoriye göre filtreleme
- Yeni / eski olarak sıralama

## 🗑️ Çöp Kutusu

- Silinen mesajları Çöp Kutusunda görüntüleme
- Gelen ve gönderilen mesajların silme durumlarını ayrı yönetme
- Mesajları Çöp Kutusundan geri yükleme
- Çöp Kutusunu boşaltma
- Birden fazla mesaj üzerinde toplu işlem yapma
- Çöp Kutusundaki mesajları filtreleme

## 🏷️ Kategori Sistemi

- Kullanıcıya özel kategori oluşturma
- Kategori düzenleme
- Kategori silme
- Kategori rengi belirleme
- Mesajları kategorilere atama
- Mesajın kategorisini değiştirme
- Mesajı kategoriden kaldırma
- Kategoriye göre mesaj görüntüleme
- Kategori içerisindeki mesajların sayfalanması

## 🔍 Arama, Filtreleme ve Sayfalama

- Mesaj arama
- Okunan / okunmayan mesaj filtreleme
- Önemli mesaj filtreleme
- Kategoriye göre filtreleme
- Yeni / eski mesaj sıralama
- Sayfalama sistemi
- Gelen Kutusu sayfalama
- Gönderilen Mesajlar sayfalama
- Taslaklar sayfalama
- Önemli Mesajlar sayfalama
- Çöp Kutusu sayfalama
- Kategoriler sayfalama
- Kategori mesajları sayfalama
- Yönetim ekranlarında sayfalama

## 🔔 Bildirim Sistemi

- Yeni mesaj geldiğinde bildirim oluşturma
- Okunmamış bildirim göstergesi
- Bildirimlerin tarih ve zaman bilgisini görüntüleme
- Bildirimi okundu olarak işaretleme
- Tüm bildirimleri okundu olarak işaretleme
- Bildirimleri ayrı ekranda görüntüleme

## 🚩 Mesaj Şikayet Sistemi

- Kullanıcıların mesajları şikayet edebilmesi
- Şikayet edilen mesajların yönetim panelinde görüntülenmesi
- Admin ve Manager rollerinin şikayet edilen mesajları inceleyebilmesi
- Şikayeti kaldırma
- Şikayet edilen mesajı silme
- Şikayet listesinin sayfalanması

## 👤 Profil ve Hesap Yönetimi

- Kullanıcı profil bilgilerini görüntüleme
- Ad ve soyad güncelleme
- Kullanıcı adı ve e-posta bilgilerini görüntüleme
- Profil fotoğrafı güncelleme
- Şifre değiştirme
- Hesap ayarları

## 👥 Rol ve Yetkilendirme

B-Mail içerisinde **User, Manager ve Admin** olmak üzere rol bazlı erişim kontrolü bulunmaktadır.

### 👤 User

- Mesaj gönderme ve görüntüleme
- Gelen Kutusunu kullanma
- Gönderilen mesajları görüntüleme
- Taslak yönetimi
- Önemli mesaj yönetimi
- Çöp Kutusu yönetimi
- Profil yönetimi
- Kategori yönetimi
- Bildirimleri görüntüleme
- Mesaj şikayet etme

### 🛡️ Manager

User yetkilerine ek olarak:

- İstatistik ekranına erişim
- Şikayet edilen mesajları inceleme
- Şikayetleri yönetme

### 👑 Admin

Manager yetkilerine ek olarak:

- Kullanıcıları listeleme ve yönetme
- Kullanıcı hesaplarını aktif / pasif yapma
- Rol oluşturma
- Rol düzenleme
- Rol silme
- Kullanıcılara rol atama
- Kullanıcı rollerini yönetme
- Sistem yönetim ekranlarına erişim

## 👥 Kullanıcı Yönetimi

Admin kullanıcılar için ayrı bir kullanıcı yönetim ekranı bulunmaktadır.

- Sistemdeki kullanıcıları listeleme
- Kullanıcı bilgilerini görüntüleme
- Kullanıcı hesaplarını aktif / pasif duruma getirme
- Rol bazlı kullanıcı yönetimi
- Sayfalama

## 🛡️ Rol Yönetimi

- Sistemdeki rolleri görüntüleme
- Yeni rol oluşturma
- Mevcut rolleri düzenleme
- Uygun rolleri silme
- Kullanıcıların mevcut rollerini görüntüleme
- Kullanıcılara yeni rol atama
- Rol listesini sayfalama

## 📊 İstatistikler

Yönetim panelinde B-Mail sisteminin genel durumunu görüntülemek için kapsamlı bir istatistik ekranı bulunmaktadır.

Gösterilen istatistikler:

- Toplam kullanıcı sayısı
- Aktif kullanıcı sayısı
- Pasif kullanıcı sayısı
- Toplam mesaj sayısı
- Bugün gönderilen mesaj sayısı
- Okunmamış mesaj sayısı
- Toplam taslak sayısı
- Çöp Kutusundaki mesaj sayısı
- Toplam rol sayısı
- En fazla mesaj gönderen kullanıcı
- En çok kullanılan kategori
- Son 7 günlük mesaj trafiği

## 📈 Mesaj Trafiği

Sistemde son **7 gün içerisinde gönderilen mesajların sayısı** grafik üzerinde görüntülenmektedir.

Bu sayede sistemdeki günlük mesaj trafiği yönetim paneli üzerinden takip edilebilmektedir.

## 🎨 Arayüz

B-Mail için sade, modern ve kullanıcı dostu bir arayüz oluşturulmuştur.

Uygulamada:

- Responsive sayfa yapıları
- Login ve Register ekranları
- Gelen Kutusu
- Gönderilen Mesajlar
- Mesaj detay ekranı
- Yeni mesaj oluşturma ekranı
- Önemli Mesajlar
- Taslaklar
- Çöp Kutusu
- Kategori yönetimi
- Bildirim ekranları
- Profil ve ayarlar
- Kullanıcı yönetimi
- Rol yönetimi
- Şikayet yönetimi
- İstatistik ekranı

bulunmaktadır.

## 🗄️ Veritabanı

Proje **Entity Framework Core** ve **Code First** yaklaşımı kullanılarak geliştirilmiştir.

Başlıca veritabanı yapıları:

- Users
- Roles
- UserMessages
- Categories
- Notifications
- MessageAttachments
- MessageReports

Mesajlarda gönderen ve alıcı ilişkileri ayrı olarak yönetilmektedir.

Gönderen ve alıcının mesaj silme durumları birbirinden bağımsız tutulduğu için bir kullanıcının mesajı silmesi diğer kullanıcının mesajını etkilememektedir.

Çöp Kutusu işlemleri de gönderen ve alıcı için ayrı olarak yönetilmektedir.

## 🏗️ Proje Yapısı

B-Mail, ASP.NET Core MVC mimarisi kullanılarak geliştirilmiştir.

Projede temel olarak:

- Controller
- View
- Entity
- DTO
- Entity Framework Core DbContext
- ASP.NET Core Identity
- ViewComponent
- JavaScript
- CSS

yapıları kullanılmaktadır.

## 🎯 Projenin Amacı

Bu projedeki temel amacım, ASP.NET Core MVC üzerinde gerçek bir uygulamada ihtiyaç duyulabilecek mesajlaşma, kimlik doğrulama, yetkilendirme, ilişkisel veritabanı tasarımı ve yönetim paneli gibi yapıları bir araya getirerek pratiğe dökmekti.

Proje boyunca özellikle:

- ASP.NET Core MVC mimarisi
- Entity Framework Core
- ASP.NET Core Identity
- LINQ sorguları
- İlişkisel veritabanı tasarımı
- Rol bazlı yetkilendirme
- Asenkron programlama
- CRUD işlemleri
- JavaScript ile dinamik kullanıcı etkileşimleri
- Responsive arayüz geliştirme
- Admin paneli geliştirme
- İstatistik ve raporlama ekranları oluşturma

konularında çalışma fırsatı buldum.

## 🙏 Teşekkür

Projenin geliştirme sürecindeki değerli rehberlikleri, destekleri ve geri bildirimleri için hocalarım **Erhan Gündüz** ve **Murat Yücedağ**'a teşekkür ederim.

## 👨‍💻 Geliştirici

**Batuhan Gökkaya**

---
## 🖼️ Projeden Görseller

<img width="1904" height="955" alt="1" src="https://github.com/user-attachments/assets/08442b19-2780-49be-8a01-edb49f644427" />
<img width="1902" height="955" alt="2" src="https://github.com/user-attachments/assets/459c0e33-839e-4271-b190-16e2d533b0a5" />
<img width="1903" height="953" alt="3" src="https://github.com/user-attachments/assets/f4279239-0660-467d-85fa-0ead1b30a974" />
<img width="1906" height="950" alt="4" src="https://github.com/user-attachments/assets/6edc4608-f2ea-4bb4-a20e-7713a8b44f18" />
<img width="1905" height="951" alt="5" src="https://github.com/user-attachments/assets/6cce8b82-5888-4056-a4e6-d5f0518e8074" />
<img width="1907" height="949" alt="6" src="https://github.com/user-attachments/assets/d0099f83-4aa3-4f7c-8854-a70672847f66" />
<img width="1905" height="952" alt="7" src="https://github.com/user-attachments/assets/5a3af1a8-7d21-4146-9a96-7bb2fea38b18" />
<img width="1908" height="950" alt="8" src="https://github.com/user-attachments/assets/d9cacbf7-9352-4ac0-918b-c94f50731854" />
<img width="1908" height="953" alt="9" src="https://github.com/user-attachments/assets/565d26df-1332-420e-8b94-70534805bfa5" />
<img width="1884" height="948" alt="10" src="https://github.com/user-attachments/assets/df52a778-ad7a-4bb5-9417-59fdbad4b4f7" />
<img width="1907" height="952" alt="11" src="https://github.com/user-attachments/assets/132bdd2c-87bd-4185-99ae-3de96c0e892f" />
<img width="1882" height="953" alt="12" src="https://github.com/user-attachments/assets/b1a62a0f-8818-4b56-93a0-e0e801f69672" />
<img width="1891" height="952" alt="13" src="https://github.com/user-attachments/assets/c048d90c-5a09-4098-9ba6-89edc03478de" />
<img width="1903" height="953" alt="14" src="https://github.com/user-attachments/assets/f7132119-1ac6-4a4f-8f07-b470c08a2322" />
<img width="1909" height="950" alt="15" src="https://github.com/user-attachments/assets/409c074c-6aff-4702-9cb9-28c5e7e6aa13" />
<img width="1906" height="948" alt="16" src="https://github.com/user-attachments/assets/303db10f-da17-46c1-8bac-3b3742f4d23c" />
<img width="1905" height="951" alt="17" src="https://github.com/user-attachments/assets/36f28b59-62e3-42a6-8b28-c06f2a0aecda" />
<img width="1903" height="949" alt="18" src="https://github.com/user-attachments/assets/5439fb32-5161-4647-a2a3-3e16bde1d169" />
<img width="1903" height="953" alt="19" src="https://github.com/user-attachments/assets/7c6f2a5b-8d11-43cb-beaa-98c39384548e" />
<img width="1894" height="953" alt="20" src="https://github.com/user-attachments/assets/04d6ac19-774c-47c6-9b9e-fb4beeea8088" />

⭐ Projeyi faydalı bulduysanız repoya yıldız bırakabilirsiniz.
