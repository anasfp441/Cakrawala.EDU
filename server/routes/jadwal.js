const express = require('express');
const { body, validationResult } = require('express-validator');
const Jadwal = require('../models/Jadwal');
const { auth, adminOnly } = require('./auth');
const router = express.Router();

// Get semua jadwal
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, hari, kelas, jurusan, semester, tahunAjaran } = req.query;
    
    let query = {};
    
    // Filter berdasarkan hari
    if (hari) {
      query.hari = hari;
    }
    
    // Filter berdasarkan kelas
    if (kelas) {
      query.kelas = kelas;
    }
    
    // Filter berdasarkan jurusan
    if (jurusan) {
      query.jurusan = jurusan;
    }
    
    // Filter berdasarkan semester
    if (semester) {
      query.semester = semester;
    }
    
    // Filter berdasarkan tahun ajaran
    if (tahunAjaran) {
      query.tahunAjaran = tahunAjaran;
    }
    
    // Filter hanya jadwal aktif
    query.isActive = true;
    
    const skip = (page - 1) * limit;
    
    const jadwal = await Jadwal.find(query)
      .populate('guru', 'nama')
      .sort({ hari: 1, jamMulai: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Jadwal.countDocuments(query);
    
    res.json({
      jadwal,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get jadwal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get jadwal berdasarkan ID
router.get('/:id', auth, async (req, res) => {
  try {
    const jadwal = await Jadwal.findById(req.params.id)
      .populate('guru', 'nama');
    
    if (!jadwal) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }
    
    res.json(jadwal);
    
  } catch (error) {
    console.error('Get jadwal by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tambah jadwal baru (admin/guru)
router.post('/', auth, [
  body('hari').isIn(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']).withMessage('Hari tidak valid'),
  body('jamMulai').notEmpty().withMessage('Jam mulai harus diisi'),
  body('jamSelesai').notEmpty().withMessage('Jam selesai harus diisi'),
  body('mataPelajaran').notEmpty().withMessage('Mata pelajaran harus diisi'),
  body('kelas').notEmpty().withMessage('Kelas harus diisi'),
  body('semester').notEmpty().withMessage('Semester harus diisi'),
  body('tahunAjaran').notEmpty().withMessage('Tahun ajaran harus diisi')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      hari,
      jamMulai,
      jamSelesai,
      mataPelajaran,
      kelas,
      jurusan,
      guru,
      ruangan,
      semester,
      tahunAjaran
    } = req.body;
    
    // Cek apakah ada konflik jadwal
    const conflictingJadwal = await Jadwal.findOne({
      hari,
      kelas,
      semester,
      tahunAjaran,
      isActive: true,
      $or: [
        {
          jamMulai: { $lt: jamSelesai },
          jamSelesai: { $gt: jamMulai }
        }
      ]
    });
    
    if (conflictingJadwal) {
      return res.status(400).json({ 
        message: 'Ada konflik jadwal dengan mata pelajaran lain pada waktu yang sama' 
      });
    }
    
    const jadwal = new Jadwal({
      hari,
      jamMulai,
      jamSelesai,
      mataPelajaran,
      kelas,
      jurusan,
      guru: guru || req.user._id,
      ruangan,
      semester,
      tahunAjaran
    });
    
    await jadwal.save();
    
    const populatedJadwal = await Jadwal.findById(jadwal._id)
      .populate('guru', 'nama');
    
    res.status(201).json({
      message: 'Jadwal berhasil ditambahkan',
      jadwal: populatedJadwal
    });
    
  } catch (error) {
    console.error('Add jadwal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update jadwal (admin/guru)
router.put('/:id', auth, [
  body('hari').isIn(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']).withMessage('Hari tidak valid'),
  body('jamMulai').notEmpty().withMessage('Jam mulai harus diisi'),
  body('jamSelesai').notEmpty().withMessage('Jam selesai harus diisi'),
  body('mataPelajaran').notEmpty().withMessage('Mata pelajaran harus diisi'),
  body('kelas').notEmpty().withMessage('Kelas harus diisi')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      hari,
      jamMulai,
      jamSelesai,
      mataPelajaran,
      kelas,
      jurusan,
      guru,
      ruangan
    } = req.body;
    
    const existingJadwal = await Jadwal.findById(req.params.id);
    
    if (!existingJadwal) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }
    
    // Jika guru, cek apakah jadwal ini miliknya
    if (req.user.role === 'guru' && existingJadwal.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Cek apakah ada konflik jadwal (kecuali dengan jadwal yang sedang diupdate)
    const conflictingJadwal = await Jadwal.findOne({
      _id: { $ne: req.params.id },
      hari,
      kelas,
      semester: existingJadwal.semester,
      tahunAjaran: existingJadwal.tahunAjaran,
      isActive: true,
      $or: [
        {
          jamMulai: { $lt: jamSelesai },
          jamSelesai: { $gt: jamMulai }
        }
      ]
    });
    
    if (conflictingJadwal) {
      return res.status(400).json({ 
        message: 'Ada konflik jadwal dengan mata pelajaran lain pada waktu yang sama' 
      });
    }
    
    const updatedJadwal = await Jadwal.findByIdAndUpdate(
      req.params.id,
      {
        hari,
        jamMulai,
        jamSelesai,
        mataPelajaran,
        kelas,
        jurusan,
        guru: guru || existingJadwal.guru,
        ruangan
      },
      { new: true }
    ).populate('guru', 'nama');
    
    res.json({
      message: 'Jadwal berhasil diupdate',
      jadwal: updatedJadwal
    });
    
  } catch (error) {
    console.error('Update jadwal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Hapus jadwal (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const jadwal = await Jadwal.findByIdAndDelete(req.params.id);
    
    if (!jadwal) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }
    
    res.json({ message: 'Jadwal berhasil dihapus' });
    
  } catch (error) {
    console.error('Delete jadwal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Nonaktifkan jadwal (admin/guru)
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const jadwal = await Jadwal.findById(req.params.id);
    
    if (!jadwal) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }
    
    // Jika guru, cek apakah jadwal ini miliknya
    if (req.user.role === 'guru' && jadwal.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    jadwal.isActive = !jadwal.isActive;
    await jadwal.save();
    
    res.json({
      message: `Jadwal berhasil ${jadwal.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      jadwal
    });
    
  } catch (error) {
    console.error('Toggle jadwal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get jadwal hari ini
router.get('/today/current', auth, async (req, res) => {
  try {
    const today = new Date();
    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][today.getDay()];
    
    if (hari === 'Minggu') {
      return res.json({ message: 'Hari ini adalah hari libur', jadwal: [] });
    }
    
    const { kelas, jurusan, semester, tahunAjaran } = req.query;
    
    let query = {
      hari,
      isActive: true
    };
    
    if (kelas) query.kelas = kelas;
    if (jurusan) query.jurusan = jurusan;
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    const jadwal = await Jadwal.find(query)
      .populate('guru', 'nama')
      .sort({ jamMulai: 1 });
    
    res.json({
      hari,
      tanggal: today.toLocaleDateString('id-ID'),
      jadwal
    });
    
  } catch (error) {
    console.error('Get today jadwal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get jadwal mingguan
router.get('/weekly', auth, async (req, res) => {
  try {
    const { kelas, jurusan, semester, tahunAjaran } = req.query;
    
    let query = {
      isActive: true
    };
    
    if (kelas) query.kelas = kelas;
    if (jurusan) query.jurusan = jurusan;
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    const jadwal = await Jadwal.find(query)
      .populate('guru', 'nama')
      .sort({ hari: 1, jamMulai: 1 });
    
    // Group berdasarkan hari
    const jadwalMingguan = {
      Senin: [],
      Selasa: [],
      Rabu: [],
      Kamis: [],
      Jumat: [],
      Sabtu: []
    };
    
    jadwal.forEach(j => {
      if (jadwalMingguan[j.hari]) {
        jadwalMingguan[j.hari].push(j);
      }
    });
    
    res.json({
      jadwalMingguan,
      totalJadwal: jadwal.length
    });
    
  } catch (error) {
    console.error('Get weekly jadwal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistik jadwal (admin)
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    
    let query = { isActive: true };
    
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    const totalJadwal = await Jadwal.countDocuments(query);
    
    // Statistik berdasarkan hari
    const statistikHari = await Jadwal.aggregate([
      { $match: query },
      { $group: { _id: '$hari', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Statistik berdasarkan kelas
    const statistikKelas = await Jadwal.aggregate([
      { $match: query },
      { $group: { _id: '$kelas', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Statistik berdasarkan mata pelajaran
    const statistikMapel = await Jadwal.aggregate([
      { $match: query },
      { $group: { _id: '$mataPelajaran', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalJadwal,
      statistikHari,
      statistikKelas,
      statistikMapel
    });
    
  } catch (error) {
    console.error('Get jadwal stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export jadwal ke CSV (admin)
router.get('/export/csv', auth, adminOnly, async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    
    let query = { isActive: true };
    
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    const jadwal = await Jadwal.find(query)
      .populate('guru', 'nama')
      .sort({ hari: 1, jamMulai: 1 });
    
    let csv = 'Hari,Jam Mulai,Jam Selesai,Mata Pelajaran,Kelas,Jurusan,Guru,Ruangan,Semester,Tahun Ajaran\n';
    
    jadwal.forEach(j => {
      csv += `"${j.hari}","${j.jamMulai}","${j.jamSelesai}","${j.mataPelajaran}","${j.kelas}","${j.jurusan || ''}","${j.guru ? j.guru.nama : ''}","${j.ruangan || ''}","${j.semester}","${j.tahunAjaran}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=jadwal-pelajaran.csv');
    res.send(csv);
    
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;