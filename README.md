# Aplikasi Pembelajaran CBT (Computer Based Test)

Aplikasi pembelajaran berbasis CBT yang lengkap untuk sekolah dengan fitur manajemen siswa, absensi, jadwal, materi, tugas, ujian, nilai, dan pengaturan sistem.

## 🚀 Fitur Utama

### 1. **Home Page** - Dashboard Utama
- Dashboard admin dengan statistik lengkap
- Overview siswa, absensi, dan akademik
- Grafik dan chart untuk visualisasi data

### 2. **Daftar Siswa** - Manajemen Data Siswa
- CRUD data siswa lengkap
- Import/export data CSV
- Filter dan pencarian siswa
- Statistik berdasarkan kelas dan jurusan

### 3. **Cek Absen Siswa** - Sistem Absensi
- Pencatatan kehadiran siswa
- Bulk absen untuk satu kelas
- Statistik kehadiran
- Export laporan absensi

### 4. **Jadwal** - Pengaturan Jadwal Pelajaran
- Manajemen jadwal mata pelajaran
- Pencegahan konflik jadwal
- Jadwal mingguan dan harian
- Export jadwal ke CSV

### 5. **Materi** - Pengelolaan Materi Pembelajaran
- Upload dan publish materi
- Full-text search
- Statistik views dan downloads
- Tag dan kategori materi

### 6. **Tugas Harian** - Manajemen Tugas
- Buat dan assign tugas
- Deadline management
- Status tracking (Draft/Published/Closed)
- Export daftar tugas

### 7. **Ujian** - Sistem CBT Lengkap
- Buat ujian dengan berbagai tipe soal
- Timer dan durasi ujian
- Auto-scoring dan grading
- Export hasil ujian
- Pencegahan kecurangan

### 8. **Nilai** - Sistem Penilaian
- Input nilai tugas, ujian, dan praktikum
- Perhitungan otomatis nilai akhir
- Grade determination (A, B+, B, C+, C, D, E)
- Rapor dan ranking siswa
- Export nilai ke CSV

### 9. **Pengaturan** - Konfigurasi Sistem
- Pengaturan sekolah dan akademik
- Konfigurasi ujian dan absensi
- Backup dan restore sistem
- Import/export pengaturan

## 🛠️ Teknologi yang Digunakan

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM untuk MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **multer** - File upload handling

### Frontend (akan dibuat)
- **React.js** - UI framework
- **Material-UI** - Component library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Chart.js** - Data visualization

## 📋 Prerequisites

Sebelum menjalankan aplikasi, pastikan sistem Anda memiliki:

- **Node.js** (versi 16 atau lebih baru)
- **MongoDB** (versi 4.4 atau lebih baru)
- **npm** atau **yarn**

## 🚀 Instalasi dan Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd aplikasi-pembelajaran-cbt
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies (setelah frontend dibuat)
cd client
npm install
cd ..
```

### 3. Setup Environment Variables
```bash
# Copy file environment
cp .env.example .env

# Edit file .env sesuai konfigurasi Anda
nano .env
```

### 4. Setup Database
```bash
# Pastikan MongoDB berjalan
mongod

# Aplikasi akan otomatis membuat database dan collection
```

### 5. Jalankan Aplikasi
```bash
# Development mode (backend + frontend)
npm run dev

# Hanya backend
npm run server

# Hanya frontend
npm run client

# Production build
npm run build
```

## 📁 Struktur Project

```
aplikasi-pembelajaran-cbt/
├── server/                 # Backend server
│   ├── models/            # Database models
│   │   ├── User.js        # User model (admin, guru, siswa)
│   │   ├── Siswa.js       # Student model
│   │   ├── Absen.js       # Attendance model
│   │   ├── Jadwal.js      # Schedule model
│   │   ├── Materi.js      # Learning material model
│   │   ├── Tugas.js       # Assignment model
│   │   ├── Ujian.js       # Exam model
│   │   └── Nilai.js       # Grade model
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── siswa.js       # Student management routes
│   │   ├── absen.js       # Attendance routes
│   │   ├── jadwal.js      # Schedule routes
│   │   ├── materi.js      # Material routes
│   │   ├── tugas.js       # Assignment routes
│   │   ├── ujian.js       # Exam routes
│   │   ├── nilai.js       # Grade routes
│   │   └── pengaturan.js  # System settings routes
│   └── index.js           # Main server file
├── client/                 # Frontend React app (akan dibuat)
├── package.json            # Project dependencies
├── .env.example           # Environment variables template
└── README.md              # Project documentation
```

## 🔐 Authentication & Authorization

### Role-based Access Control (RBAC)

1. **Admin**
   - Akses penuh ke semua fitur
   - Manajemen user dan sistem
   - Export/import data
   - Backup dan restore

2. **Guru**
   - Manajemen materi dan tugas
   - Input nilai siswa
   - Buat dan kelola ujian
   - Lihat absensi kelas yang diajar

3. **Siswa**
   - Lihat materi yang dipublish
   - Kerjakan tugas dan ujian
   - Lihat nilai dan rapor
   - Lihat jadwal pelajaran

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Ganti password

### Student Management
- `GET /api/siswa` - Get semua siswa
- `POST /api/siswa` - Tambah siswa baru
- `PUT /api/siswa/:id` - Update data siswa
- `DELETE /api/siswa/:id` - Hapus siswa
- `GET /api/siswa/stats/overview` - Statistik siswa

### Attendance
- `GET /api/absen` - Get semua absen
- `POST /api/absen` - Tambah absen
- `POST /api/absen/bulk` - Bulk absen
- `GET /api/absen/stats/overview` - Statistik absen

### Schedule
- `GET /api/jadwal` - Get semua jadwal
- `POST /api/jadwal` - Tambah jadwal
- `GET /api/jadwal/today/current` - Jadwal hari ini
- `GET /api/jadwal/weekly` - Jadwal mingguan

### Learning Material
- `GET /api/materi` - Get semua materi
- `POST /api/materi` - Tambah materi
- `PATCH /api/materi/:id/publish` - Publish/unpublish materi
- `GET /api/materi/search/advanced` - Advanced search

### Assignment
- `GET /api/tugas` - Get semua tugas
- `POST /api/tugas` - Tambah tugas
- `PATCH /api/tugas/:id/status` - Update status tugas
- `GET /api/tugas/overdue` - Tugas yang deadline lewat

### Exam (CBT)
- `GET /api/ujian` - Get semua ujian
- `POST /api/ujian` - Buat ujian baru
- `POST /api/ujian/:id/start` - Mulai ujian
- `POST /api/ujian/:id/submit` - Submit jawaban
- `GET /api/ujian/:id/result` - Hasil ujian

### Grades
- `GET /api/nilai` - Get semua nilai
- `POST /api/nilai` - Input nilai
- `GET /api/nilai/rapor/:siswaId` - Rapor siswa
- `GET /api/nilai/stats/overview` - Statistik nilai

### System Settings
- `GET /api/pengaturan` - Get semua pengaturan
- `PUT /api/pengaturan` - Update pengaturan
- `POST /api/pengaturan/reset` - Reset ke default
- `GET /api/pengaturan/export/json` - Export pengaturan

## 🔧 Konfigurasi Database

### MongoDB Collections

1. **users** - Data user (admin, guru, siswa)
2. **siswa** - Data siswa lengkap
3. **absen** - Data kehadiran siswa
4. **jadwal** - Jadwal pelajaran
5. **materi** - Materi pembelajaran
6. **tugas** - Tugas harian
7. **ujian** - Data ujian CBT
8. **nilai** - Nilai siswa

### Indexes
- Compound indexes untuk optimasi query
- Text indexes untuk full-text search
- Unique constraints untuk mencegah duplikasi

## 📱 Fitur CBT (Computer Based Test)

### Tipe Soal
- **Pilihan Ganda** - Multiple choice questions
- **Essay** - Essay questions
- **True/False** - Benar/Salah

### Fitur Ujian
- Timer otomatis
- Randomisasi soal (opsional)
- Shuffle pilihan jawaban (opsional)
- Auto-scoring
- Passing grade
- Maksimal percobaan
- Pencegahan kecurangan

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build frontend
npm run build

# Set NODE_ENV=production
export NODE_ENV=production

# Start server
npm start
```

### Docker (akan dibuat)
```bash
# Build image
docker build -t cbt-app .

# Run container
docker run -p 5000:5000 cbt-app
```

## 🧪 Testing

### Backend Testing
```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

### Frontend Testing (akan dibuat)
```bash
cd client
npm test
```

## 📈 Monitoring & Logging

- **Console logging** untuk development
- **File logging** untuk production
- **Error tracking** dengan try-catch
- **Performance monitoring** dengan response time

## 🔒 Security Features

- **JWT authentication** dengan expiry
- **Password hashing** dengan bcrypt
- **Input validation** dengan express-validator
- **Role-based access control**
- **CORS protection**
- **Rate limiting** (akan ditambahkan)
- **SQL injection protection** (MongoDB)
- **XSS protection**

## 📊 Performance Optimization

- **Database indexing** untuk query optimization
- **Pagination** untuk data besar
- **Caching** (akan ditambahkan)
- **Compression** (akan ditambahkan)
- **CDN** untuk static files (akan ditambahkan)

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Untuk dukungan dan pertanyaan:

- **Email**: support@cbt-sekolah.com
- **Documentation**: [Wiki](link-ke-wiki)
- **Issues**: [GitHub Issues](link-ke-issues)

## 🙏 Acknowledgments

- **Express.js** team untuk framework yang luar biasa
- **MongoDB** untuk database yang powerful
- **React** team untuk frontend framework
- **Material-UI** untuk component library yang indah

---

**Dibuat dengan ❤️ untuk dunia pendidikan Indonesia**
