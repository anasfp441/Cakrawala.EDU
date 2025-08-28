# 🚀 CBT Sekolah - Panduan Instalasi XAMPP

Aplikasi CBT (Computer Based Test) Sekolah yang dapat dijalankan di XAMPP localhost.

## 📋 **Persyaratan Sistem**

- **XAMPP** versi 8.0 atau lebih baru
- **PHP** 8.0 atau lebih baru
- **MySQL** 8.0 atau lebih baru
- **Apache** 2.4 atau lebih baru
- **Browser** modern (Chrome, Firefox, Safari, Edge)

## 🛠️ **Langkah Instalasi**

### **1. Download dan Install XAMPP**

1. Download XAMPP dari [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Install XAMPP sesuai dengan sistem operasi Anda
3. Pastikan Apache dan MySQL berjalan

### **2. Setup Project**

1. **Buka folder XAMPP:**
   ```
   C:\xampp\htdocs\ (Windows)
   /Applications/XAMPP/htdocs/ (macOS)
   /opt/lampp/htdocs/ (Linux)
   ```

2. **Buat folder project:**
   ```
   mkdir cbt-sekolah
   cd cbt-sekolah
   ```

3. **Copy semua file project ke folder tersebut**

### **3. Setup Database**

1. **Buka phpMyAdmin:**
   - Buka browser
   - Ketik: `http://localhost/phpmyadmin`

2. **Buat database baru:**
   - Klik "New" di sidebar kiri
   - Masukkan nama database: `cbt_sekolah_db`
   - Pilih collation: `utf8mb4_unicode_ci`
   - Klik "Create"

3. **Import database schema:**
   - Pilih database `cbt_sekolah_db`
   - Klik tab "Import"
   - Upload file `database.sql`
   - Klik "Go"

### **4. Setup Otomatis (Alternatif)**

Jika ingin setup otomatis:

1. **Jalankan setup script:**
   ```
   http://localhost/cbt-sekolah/setup-database-xampp.php
   ```

2. **Script akan otomatis:**
   - Membuat database
   - Membuat semua tabel
   - Insert data sample
   - Membuat user default

## 🔧 **Konfigurasi**

### **1. File Konfigurasi**

File `config-xampp.php` sudah dikonfigurasi untuk XAMPP:

```php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'cbt_sekolah_db');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', ''); // XAMPP default: no password
```

### **2. Customisasi Konfigurasi**

Jika ingin mengubah konfigurasi:

1. **Edit file `config-xampp.php`**
2. **Ubah nilai sesuai kebutuhan:**
   - Database credentials
   - Upload path
   - Session timeout
   - Email settings

## 🚀 **Menjalankan Aplikasi**

### **1. Start XAMPP Services**

1. **Buka XAMPP Control Panel**
2. **Start Apache dan MySQL**
3. **Pastikan status "Running"**

### **2. Akses Aplikasi**

1. **Buka browser**
2. **Ketik URL:**
   ```
   http://localhost/cbt-sekolah/
   ```

### **3. Login dengan Credentials Default**

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Guru** | `guru` | `guru123` |
| **Siswa** | `siswa` | `siswa123` |

## 📁 **Struktur Folder**

```
cbt-sekolah/
├── index.html              # Halaman utama
├── login.html              # Halaman login
├── styles.css              # CSS utama
├── script.js               # JavaScript utama
├── config-xampp.php        # Konfigurasi XAMPP
├── setup-database-xampp.php # Setup database otomatis
├── database.sql            # Schema database
├── .htaccess               # Konfigurasi Apache
├── api/                    # Folder API
│   └── auth.php           # API Authentication
├── admin/                  # Dashboard Admin
├── guru/                   # Dashboard Guru
├── siswa/                  # Dashboard Siswa
├── uploads/                # File uploads
├── logs/                   # Log files
├── cache/                  # Cache files
└── README-XAMPP.md         # File ini
```

## 🔍 **Troubleshooting**

### **1. Database Connection Error**

**Error:** "Database connection failed"

**Solusi:**
1. Pastikan MySQL berjalan di XAMPP
2. Check credentials di `config-xampp.php`
3. Pastikan database `cbt_sekolah_db` sudah dibuat

### **2. Permission Denied**

**Error:** "Permission denied" saat upload file

**Solusi:**
1. Pastikan folder `uploads/` ada
2. Set permission folder ke 755 atau 777
3. Pastikan Apache user memiliki akses write

### **3. Session Not Working**

**Error:** Session tidak tersimpan

**Solusi:**
1. Check folder `sessions/` sudah dibuat
2. Pastikan PHP session extension aktif
3. Check `php.ini` session settings

### **4. File Not Found**

**Error:** "404 Not Found"

**Solusi:**
1. Pastikan file `.htaccess` ada
2. Check Apache mod_rewrite aktif
3. Restart Apache service

## 📊 **Fitur Aplikasi**

### **1. Admin Dashboard**
- Manajemen user (Admin, Guru, Siswa)
- Manajemen mata pelajaran
- Manajemen ujian
- Laporan dan statistik
- Backup database

### **2. Guru Dashboard**
- Buat dan edit ujian
- Upload materi pembelajaran
- Buat tugas
- Lihat hasil ujian siswa
- Kelola kelas

### **3. Siswa Dashboard**
- Ikut ujian online
- Lihat materi pembelajaran
- Submit tugas
- Lihat nilai dan progress
- Download sertifikat

## 🛡️ **Keamanan**

### **1. Password Hashing**
- Semua password di-hash menggunakan `password_hash()`
- Salt otomatis untuk setiap user

### **2. Session Management**
- Session timeout otomatis (2 jam)
- Session regeneration untuk keamanan
- CSRF protection

### **3. Input Validation**
- Sanitasi input otomatis
- Prepared statements untuk query database
- Validasi file upload

## 📈 **Performance**

### **1. Database Optimization**
- Index pada kolom yang sering di-query
- Foreign key constraints
- Query optimization

### **2. Caching**
- File-based caching
- Session caching
- Database connection pooling

### **3. File Management**
- Compressed file uploads
- Image optimization
- Lazy loading untuk konten

## 🔄 **Update dan Maintenance**

### **1. Backup Database**
```bash
# Manual backup
mysqldump -u root -p cbt_sekolah_db > backup.sql

# Restore backup
mysql -u root -p cbt_sekolah_db < backup.sql
```

### **2. Update Aplikasi**
1. Backup database dan file
2. Replace file lama dengan yang baru
3. Run database migration jika ada
4. Test aplikasi

### **3. Log Monitoring**
- Check folder `logs/` untuk error logs
- Monitor Apache error logs
- Check MySQL slow query logs

## 📞 **Support**

### **1. Dokumentasi**
- File ini (README-XAMPP.md)
- Komentar dalam kode
- Database schema documentation

### **2. Log Files**
- Application logs: `logs/` folder
- Apache logs: XAMPP logs
- MySQL logs: XAMPP logs

### **3. Common Issues**
- Database connection: Check MySQL service
- File upload: Check folder permissions
- Session: Check PHP configuration
- 404 errors: Check .htaccess and mod_rewrite

## 🎯 **Next Steps**

Setelah aplikasi berjalan:

1. **Customize UI/UX** sesuai kebutuhan sekolah
2. **Add more features** seperti:
   - Video streaming untuk materi
   - Real-time notifications
   - Mobile app integration
   - Advanced reporting
3. **Deploy to production** server
4. **Setup monitoring** dan backup otomatis

## 📝 **Changelog**

### **v1.0.0** (Current)
- ✅ Basic CBT functionality
- ✅ User management (Admin, Guru, Siswa)
- ✅ Exam creation and management
- ✅ Material upload system
- ✅ Assignment system
- ✅ Basic reporting
- ✅ XAMPP compatibility

---

**🎉 Selamat! Aplikasi CBT Sekolah sudah siap digunakan di XAMPP localhost.**

Jika ada pertanyaan atau masalah, silakan check troubleshooting section atau buat issue di repository.