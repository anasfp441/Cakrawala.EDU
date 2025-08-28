const express = require('express');
const { body, validationResult } = require('express-validator');
const Siswa = require('../models/Siswa');
const { auth, adminOnly } = require('./auth');
const router = express.Router();

// Get semua siswa (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, kelas, jurusan, status } = req.query;
    
    let query = {};
    
    // Filter berdasarkan search
    if (search) {
      query.$or = [
        { nama: { $regex: search, $options: 'i' } },
        { nis: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter berdasarkan kelas
    if (kelas) {
      query.kelas = kelas;
    }
    
    // Filter berdasarkan jurusan
    if (jurusan) {
      query.jurusan = jurusan;
    }
    
    // Filter berdasarkan status
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const siswa = await Siswa.find(query)
      .sort({ nama: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Siswa.countDocuments(query);
    
    res.json({
      siswa,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get siswa error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get siswa berdasarkan ID
router.get('/:id', auth, async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.id);
    
    if (!siswa) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    
    // Jika bukan admin, cek apakah user yang login adalah siswa tersebut
    if (req.user.role !== 'admin' && req.user.nis !== siswa.nis) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(siswa);
    
  } catch (error) {
    console.error('Get siswa by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tambah siswa baru (admin only)
router.post('/', auth, adminOnly, [
  body('nis').notEmpty().withMessage('NIS harus diisi'),
  body('nama').notEmpty().withMessage('Nama harus diisi'),
  body('kelas').notEmpty().withMessage('Kelas harus diisi'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('jenisKelamin').isIn(['Laki-laki', 'Perempuan']).withMessage('Jenis kelamin tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      nis,
      nama,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      alamat,
      noTelp,
      email,
      kelas,
      jurusan,
      tahunMasuk,
      namaWali,
      noTelpWali,
      alamatWali
    } = req.body;
    
    // Cek apakah NIS sudah ada
    const existingSiswa = await Siswa.findOne({ nis });
    if (existingSiswa) {
      return res.status(400).json({ message: 'NIS sudah terdaftar' });
    }
    
    // Cek apakah email sudah ada
    if (email) {
      const existingEmail = await Siswa.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email sudah terdaftar' });
      }
    }
    
    const siswa = new Siswa({
      nis,
      nama,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      alamat,
      noTelp,
      email,
      kelas,
      jurusan,
      tahunMasuk: tahunMasuk || new Date().getFullYear(),
      namaWali,
      noTelpWali,
      alamatWali
    });
    
    await siswa.save();
    
    res.status(201).json({
      message: 'Siswa berhasil ditambahkan',
      siswa
    });
    
  } catch (error) {
    console.error('Add siswa error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update data siswa (admin only)
router.put('/:id', auth, adminOnly, [
  body('nama').notEmpty().withMessage('Nama harus diisi'),
  body('kelas').notEmpty().withMessage('Kelas harus diisi'),
  body('email').isEmail().withMessage('Email tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      nama,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      alamat,
      noTelp,
      email,
      kelas,
      jurusan,
      tahunMasuk,
      namaWali,
      noTelpWali,
      alamatWali
    } = req.body;
    
    // Cek apakah email sudah digunakan siswa lain
    if (email) {
      const existingEmail = await Siswa.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email sudah digunakan' });
      }
    }
    
    const siswa = await Siswa.findByIdAndUpdate(
      req.params.id,
      {
        nama,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        alamat,
        noTelp,
        email,
        kelas,
        jurusan,
        tahunMasuk,
        namaWali,
        noTelpWali,
        alamatWali
      },
      { new: true }
    );
    
    if (!siswa) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    
    res.json({
      message: 'Data siswa berhasil diupdate',
      siswa
    });
    
  } catch (error) {
    console.error('Update siswa error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Hapus siswa (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const siswa = await Siswa.findByIdAndDelete(req.params.id);
    
    if (!siswa) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    
    res.json({ message: 'Siswa berhasil dihapus' });
    
  } catch (error) {
    console.error('Delete siswa error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistik siswa (admin only)
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalSiswa = await Siswa.countDocuments();
    const siswaAktif = await Siswa.countDocuments({ status: 'Aktif' });
    const siswaLulus = await Siswa.countDocuments({ status: 'Lulus' });
    const siswaDO = await Siswa.countDocuments({ status: 'Drop Out' });
    
    // Statistik berdasarkan kelas
    const statistikKelas = await Siswa.aggregate([
      { $group: { _id: '$kelas', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Statistik berdasarkan jurusan
    const statistikJurusan = await Siswa.aggregate([
      { $group: { _id: '$jurusan', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalSiswa,
      siswaAktif,
      siswaLulus,
      siswaDO,
      statistikKelas,
      statistikJurusan
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export data siswa ke CSV (admin only)
router.get('/export/csv', auth, adminOnly, async (req, res) => {
  try {
    const siswa = await Siswa.find().sort({ nama: 1 });
    
    let csv = 'NIS,Nama,Tempat Lahir,Tanggal Lahir,Jenis Kelamin,Alamat,No Telp,Email,Kelas,Jurusan,Tahun Masuk,Status\n';
    
    siswa.forEach(s => {
      csv += `${s.nis},"${s.nama}","${s.tempatLahir || ''}","${s.tanggalLahir || ''}","${s.jenisKelamin || ''}","${s.alamat || ''}","${s.noTelp || ''}","${s.email || ''}","${s.kelas}","${s.jurusan || ''}","${s.tahunMasuk || ''}","${s.status}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=daftar-siswa.csv');
    res.send(csv);
    
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;