const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, adminOnly } = require('./auth');
const router = express.Router();

// Model untuk pengaturan sistem
const systemSettings = {
  // Pengaturan umum
  namaSekolah: 'SMA Negeri 1 Contoh',
  alamatSekolah: 'Jl. Contoh No. 123, Kota Contoh',
  teleponSekolah: '021-1234567',
  emailSekolah: 'info@sman1contoh.sch.id',
  websiteSekolah: 'https://sman1contoh.sch.id',
  
  // Pengaturan akademik
  tahunAjaranAktif: '2024/2025',
  semesterAktif: 'Ganjil',
  tanggalMulaiSemester: '2024-07-15',
  tanggalSelesaiSemester: '2024-12-20',
  tanggalLibur: [
    '2024-08-17', // Hari Kemerdekaan
    '2024-09-28', // Maulid Nabi
    '2024-10-02', // Hari Raya Nyepi
    '2024-11-01', // Hari Raya Waisak
    '2024-12-25'  // Hari Natal
  ],
  
  // Pengaturan ujian
  durasiUjianDefault: 90, // menit
  passingGradeDefault: 70,
  maksimalPercobaanUjian: 2,
  
  // Pengaturan absen
  toleransiKeterlambatan: 15, // menit
  maksimalAbsenAlpha: 3, // per minggu
  
  // Pengaturan notifikasi
  emailNotifikasi: true,
  smsNotifikasi: false,
  notifikasiDeadline: true,
  notifikasiPengumuman: true,
  
  // Pengaturan keamanan
  sessionTimeout: 30, // menit
  maksimalLoginGagal: 5,
  lockoutDuration: 15, // menit
  
  // Pengaturan backup
  autoBackup: true,
  backupFrequency: 'daily', // daily, weekly, monthly
  backupRetention: 30, // hari
  
  // Pengaturan tampilan
  temaAplikasi: 'light', // light, dark
  bahasaAplikasi: 'id', // id, en
  zonaWaktu: 'Asia/Jakarta'
};

// Get semua pengaturan (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    res.json({
      message: 'Pengaturan sistem berhasil diambil',
      settings: systemSettings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update pengaturan (admin only)
router.put('/', auth, adminOnly, [
  body('namaSekolah').optional().notEmpty().withMessage('Nama sekolah tidak boleh kosong'),
  body('alamatSekolah').optional().notEmpty().withMessage('Alamat sekolah tidak boleh kosong'),
  body('teleponSekolah').optional().notEmpty().withMessage('Telepon sekolah tidak boleh kosong'),
  body('emailSekolah').optional().isEmail().withMessage('Email sekolah tidak valid'),
  body('websiteSekolah').optional().isURL().withMessage('Website sekolah tidak valid'),
  body('tahunAjaranAktif').optional().notEmpty().withMessage('Tahun ajaran aktif tidak boleh kosong'),
  body('semesterAktif').optional().isIn(['Ganjil', 'Genap']).withMessage('Semester aktif tidak valid'),
  body('durasiUjianDefault').optional().isInt({ min: 30, max: 180 }).withMessage('Durasi ujian default harus antara 30-180 menit'),
  body('passingGradeDefault').optional().isInt({ min: 0, max: 100 }).withMessage('Passing grade default harus antara 0-100'),
  body('toleransiKeterlambatan').optional().isInt({ min: 0, max: 60 }).withMessage('Toleransi keterlambatan harus antara 0-60 menit'),
  body('maksimalAbsenAlpha').optional().isInt({ min: 1, max: 10 }).withMessage('Maksimal absen alpha harus antara 1-10'),
  body('sessionTimeout').optional().isInt({ min: 15, max: 120 }).withMessage('Session timeout harus antara 15-120 menit'),
  body('maksimalLoginGagal').optional().isInt({ min: 3, max: 10 }).withMessage('Maksimal login gagal harus antara 3-10'),
  body('lockoutDuration').optional().isInt({ min: 5, max: 60 }).withMessage('Lockout duration harus antara 5-60 menit'),
  body('backupRetention').optional().isInt({ min: 7, max: 365 }).withMessage('Backup retention harus antara 7-365 hari'),
  body('temaAplikasi').optional().isIn(['light', 'dark']).withMessage('Tema aplikasi tidak valid'),
  body('bahasaAplikasi').optional().isIn(['id', 'en']).withMessage('Bahasa aplikasi tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Update pengaturan yang dikirim
    Object.keys(req.body).forEach(key => {
      if (systemSettings.hasOwnProperty(key)) {
        systemSettings[key] = req.body[key];
      }
    });
    
    res.json({
      message: 'Pengaturan sistem berhasil diupdate',
      settings: systemSettings
    });
    
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset pengaturan ke default (admin only)
router.post('/reset', auth, adminOnly, async (req, res) => {
  try {
    // Reset ke pengaturan default
    Object.assign(systemSettings, {
      namaSekolah: 'SMA Negeri 1 Contoh',
      alamatSekolah: 'Jl. Contoh No. 123, Kota Contoh',
      teleponSekolah: '021-1234567',
      emailSekolah: 'info@sman1contoh.sch.id',
      websiteSekolah: 'https://sman1contoh.sch.id',
      tahunAjaranAktif: '2024/2025',
      semesterAktif: 'Ganjil',
      tanggalMulaiSemester: '2024-07-15',
      tanggalSelesaiSemester: '2024-12-20',
      durasiUjianDefault: 90,
      passingGradeDefault: 70,
      maksimalPercobaanUjian: 2,
      toleransiKeterlambatan: 15,
      maksimalAbsenAlpha: 3,
      emailNotifikasi: true,
      smsNotifikasi: false,
      notifikasiDeadline: true,
      notifikasiPengumuman: true,
      sessionTimeout: 30,
      maksimalLoginGagal: 5,
      lockoutDuration: 15,
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      temaAplikasi: 'light',
      bahasaAplikasi: 'id',
      zonaWaktu: 'Asia/Jakarta'
    });
    
    res.json({
      message: 'Pengaturan sistem berhasil direset ke default',
      settings: systemSettings
    });
    
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pengaturan spesifik (admin only)
router.get('/:key', auth, adminOnly, async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!systemSettings.hasOwnProperty(key)) {
      return res.status(404).json({ message: 'Pengaturan tidak ditemukan' });
    }
    
    res.json({
      key,
      value: systemSettings[key]
    });
    
  } catch (error) {
    console.error('Get specific setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update pengaturan spesifik (admin only)
router.put('/:key', auth, adminOnly, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!systemSettings.hasOwnProperty(key)) {
      return res.status(404).json({ message: 'Pengaturan tidak ditemukan' });
    }
    
    // Validasi berdasarkan tipe data
    const currentValue = systemSettings[key];
    const currentType = typeof currentValue;
    
    if (typeof value !== currentType) {
      return res.status(400).json({ 
        message: `Nilai harus bertipe ${currentType}` 
      });
    }
    
    // Validasi khusus untuk beberapa pengaturan
    if (key === 'durasiUjianDefault' && (value < 30 || value > 180)) {
      return res.status(400).json({ 
        message: 'Durasi ujian default harus antara 30-180 menit' 
      });
    }
    
    if (key === 'passingGradeDefault' && (value < 0 || value > 100)) {
      return res.status(400).json({ 
        message: 'Passing grade default harus antara 0-100' 
      });
    }
    
    if (key === 'semesterAktif' && !['Ganjil', 'Genap'].includes(value)) {
      return res.status(400).json({ 
        message: 'Semester aktif harus Ganjil atau Genap' 
      });
    }
    
    // Update pengaturan
    systemSettings[key] = value;
    
    res.json({
      message: `Pengaturan ${key} berhasil diupdate`,
      key,
      value: systemSettings[key]
    });
    
  } catch (error) {
    console.error('Update specific setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pengaturan yang bisa diakses publik
router.get('/public/info', async (req, res) => {
  try {
    res.json({
      namaSekolah: systemSettings.namaSekolah,
      alamatSekolah: systemSettings.alamatSekolah,
      teleponSekolah: systemSettings.teleponSekolah,
      emailSekolah: systemSettings.emailSekolah,
      websiteSekolah: systemSettings.websiteSekolah,
      tahunAjaranAktif: systemSettings.tahunAjaranAktif,
      semesterAktif: systemSettings.semesterAktif
    });
  } catch (error) {
    console.error('Get public info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pengaturan akademik (untuk guru dan siswa)
router.get('/academic/config', auth, async (req, res) => {
  try {
    res.json({
      tahunAjaranAktif: systemSettings.tahunAjaranAktif,
      semesterAktif: systemSettings.semesterAktif,
      tanggalMulaiSemester: systemSettings.tanggalMulaiSemester,
      tanggalSelesaiSemester: systemSettings.tanggalSelesaiSemester,
      tanggalLibur: systemSettings.tanggalLibur,
      durasiUjianDefault: systemSettings.durasiUjianDefault,
      passingGradeDefault: systemSettings.passingGradeDefault,
      toleransiKeterlambatan: systemSettings.toleransiKeterlambatan,
      maksimalAbsenAlpha: systemSettings.maksimalAbsenAlpha
    });
  } catch (error) {
    console.error('Get academic config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pengaturan notifikasi (untuk user yang login)
router.get('/notifications/config', auth, async (req, res) => {
  try {
    res.json({
      emailNotifikasi: systemSettings.emailNotifikasi,
      smsNotifikasi: systemSettings.smsNotifikasi,
      notifikasiDeadline: systemSettings.notifikasiDeadline,
      notifikasiPengumuman: systemSettings.notifikasiPengumuman
    });
  } catch (error) {
    console.error('Get notification config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pengaturan tampilan (untuk user yang login)
router.get('/display/config', auth, async (req, res) => {
  try {
    res.json({
      temaAplikasi: systemSettings.temaAplikasi,
      bahasaAplikasi: systemSettings.bahasaAplikasi,
      zonaWaktu: systemSettings.zonaWaktu
    });
  } catch (error) {
    console.error('Get display config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export pengaturan ke JSON (admin only)
router.get('/export/json', auth, adminOnly, async (req, res) => {
  try {
    const exportData = {
      exportDate: new Date().toISOString(),
      exportedBy: req.user.nama,
      settings: systemSettings
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=pengaturan-sistem.json');
    res.json(exportData);
    
  } catch (error) {
    console.error('Export settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Import pengaturan dari JSON (admin only)
router.post('/import/json', auth, adminOnly, async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Data pengaturan tidak valid' });
    }
    
    // Update pengaturan yang valid
    let updatedCount = 0;
    Object.keys(settings).forEach(key => {
      if (systemSettings.hasOwnProperty(key)) {
        systemSettings[key] = settings[key];
        updatedCount++;
      }
    });
    
    res.json({
      message: `${updatedCount} pengaturan berhasil diimport`,
      updatedCount,
      settings: systemSettings
    });
    
  } catch (error) {
    console.error('Import settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Backup pengaturan (admin only)
router.post('/backup', auth, adminOnly, async (req, res) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      createdBy: req.user.nama,
      settings: systemSettings
    };
    
    // Simpan backup (dalam implementasi nyata, simpan ke database atau file)
    // Untuk contoh ini, kita hanya return data backup
    
    res.json({
      message: 'Backup pengaturan berhasil dibuat',
      backup: backupData
    });
    
  } catch (error) {
    console.error('Backup settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Restore pengaturan dari backup (admin only)
router.post('/restore', auth, adminOnly, async (req, res) => {
  try {
    const { backupId, confirm } = req.body;
    
    if (!confirm) {
      return res.status(400).json({ 
        message: 'Konfirmasi diperlukan untuk restore pengaturan' 
      });
    }
    
    // Dalam implementasi nyata, ambil data backup dari database
    // Untuk contoh ini, kita restore ke pengaturan default
    
    Object.assign(systemSettings, {
      namaSekolah: 'SMA Negeri 1 Contoh',
      alamatSekolah: 'Jl. Contoh No. 123, Kota Contoh',
      teleponSekolah: '021-1234567',
      emailSekolah: 'info@sman1contoh.sch.id',
      websiteSekolah: 'https://sman1contoh.sch.id',
      tahunAjaranAktif: '2024/2025',
      semesterAktif: 'Ganjil',
      durasiUjianDefault: 90,
      passingGradeDefault: 70
    });
    
    res.json({
      message: 'Pengaturan berhasil direstore',
      settings: systemSettings
    });
    
  } catch (error) {
    console.error('Restore settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;