# Sistem Rekap Nilai Siswa

Aplikasi web untuk mengelola dan menganalisis nilai siswa dengan sistem penilaian berbobot yang komprehensif.

## 🎯 Fitur Utama

### Sistem Penilaian
- **Nilai Ujian**: Bobot 60% dari nilai akhir
- **Nilai Tugas Harian**: Bobot 40% dari nilai akhir  
- **Bonus Kehadiran**: Tambahan 10% jika kehadiran ≥80%
- **Nilai Maksimal**: 100 (dengan bonus kehadiran)

### Fungsi Aplikasi
- ✅ Tambah, edit, dan hapus data siswa
- 📊 Dashboard dengan ringkasan statistik
- 📈 Visualisasi distribusi nilai (A, B, C, D, E)
- 💾 Penyimpanan data lokal (localStorage)
- 📥 Export data ke format CSV/Excel
- 📱 Responsif untuk desktop dan mobile

### Kriteria Penilaian
- **Grade A**: 90-100 (Sangat Baik)
- **Grade B**: 80-89 (Baik)
- **Grade C**: 70-79 (Cukup)
- **Grade D**: 60-69 (Kurang)
- **Grade E**: <60 (Sangat Kurang)

### Status Kelulusan
- **Lulus**: Nilai akhir ≥60
- **Tidak Lulus**: Nilai akhir <60

## 🚀 Cara Penggunaan

### 1. Menambah Siswa Baru
1. Klik tombol "Tambah Siswa"
2. Isi form dengan data lengkap:
   - Nama siswa
   - Nilai ujian (0-100)
   - Nilai tugas harian (0-100)
   - Persentase kehadiran (0-100%)
3. Klik "Simpan"

### 2. Mengedit Data Siswa
1. Klik tombol "Edit" pada baris siswa yang ingin diedit
2. Ubah data yang diperlukan
3. Klik "Simpan"

### 3. Menghapus Data Siswa
1. Klik tombol "Hapus" pada baris siswa yang ingin dihapus
2. Konfirmasi penghapusan

### 4. Export Data
1. Klik tombol "Export Excel"
2. File CSV akan otomatis terdownload
3. Buka file dengan Excel atau aplikasi spreadsheet lainnya

## 📱 Tampilan Aplikasi

### Dashboard
- **Total Siswa**: Jumlah keseluruhan siswa
- **Rata-rata Nilai**: Nilai rata-rata kelas
- **Nilai Tertinggi**: Nilai siswa terbaik
- **Nilai Terendah**: Nilai siswa terendah

### Tabel Nilai
- Nomor urut
- Nama siswa
- Nilai ujian dan tugas
- Persentase kehadiran
- Nilai akhir (otomatis terhitung)
- Grade dan status kelulusan
- Tombol aksi (edit/hapus)

### Distribusi Nilai
- Grafik batang visual untuk setiap grade
- Jumlah siswa per grade
- Persentase distribusi

## 🛠️ Teknologi yang Digunakan

- **HTML5**: Struktur halaman
- **CSS3**: Styling dan animasi
- **JavaScript (ES6+)**: Logika aplikasi
- **Font Awesome**: Ikon
- **Google Fonts**: Tipografi
- **LocalStorage**: Penyimpanan data lokal

## 📁 Struktur File

```
├── index.html          # Halaman utama
├── style.css           # Styling dan layout
├── script.js           # Logika aplikasi
└── README.md           # Dokumentasi
```

## 🔧 Instalasi dan Penggunaan

### Cara 1: Langsung Buka File
1. Download semua file ke folder yang sama
2. Buka file `index.html` di browser
3. Aplikasi siap digunakan

### Cara 2: Server Lokal
1. Install Node.js
2. Buka terminal di folder project
3. Jalankan: `npx http-server`
4. Buka browser ke `http://localhost:8080`

### Cara 3: Live Server (VS Code)
1. Install extension "Live Server"
2. Klik kanan pada `index.html`
3. Pilih "Open with Live Server"

## 💾 Penyimpanan Data

- Data disimpan di browser menggunakan localStorage
- Data tidak akan hilang saat refresh halaman
- Data tersimpan per browser/device
- Untuk backup, gunakan fitur export

## 📊 Rumus Perhitungan Nilai

```
Nilai Akhir = (Nilai Ujian × 0.6) + (Nilai Tugas × 0.4) + Bonus Kehadiran

Dimana:
- Bonus Kehadiran = Kehadiran × 0.1 (jika kehadiran ≥80%)
- Nilai maksimal = 100
```

### Contoh Perhitungan
**Siswa A:**
- Nilai Ujian: 85
- Nilai Tugas: 90
- Kehadiran: 95%

**Perhitungan:**
```
Nilai Akhir = (85 × 0.6) + (90 × 0.4) + (95 × 0.1)
            = 51 + 36 + 9.5
            = 96.5
```

## 🎨 Fitur UI/UX

- **Design Modern**: Gradient background dan card design
- **Responsif**: Optimal di desktop, tablet, dan mobile
- **Animasi**: Hover effects dan transisi smooth
- **Color Coding**: Grade dan status dengan warna yang berbeda
- **Modal Form**: Form input yang user-friendly
- **Real-time Update**: Data terupdate otomatis

## 🔒 Keamanan dan Validasi

- Validasi input (nilai 0-100)
- Konfirmasi sebelum menghapus data
- Sanitasi input untuk mencegah XSS
- Error handling untuk input yang tidak valid

## 🚀 Pengembangan Selanjutnya

Fitur yang bisa ditambahkan:
- [ ] Database backend (MySQL/PostgreSQL)
- [ ] Sistem login dan user management
- [ ] Multiple kelas dan mata pelajaran
- [ ] Grafik dan chart yang lebih advanced
- [ ] Import data dari Excel/CSV
- [ ] Backup dan restore data
- [ ] Print laporan nilai
- [ ] Notifikasi dan reminder
- [ ] API untuk integrasi dengan sistem lain

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Periksa console browser untuk error
2. Pastikan semua file ada dalam folder yang sama
3. Gunakan browser modern (Chrome, Firefox, Safari, Edge)

## 📄 Lisensi

Project ini dibuat untuk tujuan edukasi dan dapat digunakan secara bebas.

---

**Dibuat dengan ❤️ untuk dunia pendidikan Indonesia**
