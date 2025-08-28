const express = require('express');
const { body, validationResult } = require('express-validator');
const Absen = require('../models/Absen');
const Siswa = require('../models/Siswa');
const { auth, adminOnly } = require('./auth');
const router = express.Router();

// Get semua absen (admin/guru)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, tanggal, kelas, mataPelajaran, status, semester, tahunAjaran } = req.query;
    
    let query = {};
    
    // Filter berdasarkan tanggal
    if (tanggal) {
      const startDate = new Date(tanggal);
      const endDate = new Date(tanggal);
      endDate.setDate(endDate.getDate() + 1);
      query.tanggal = { $gte: startDate, $lt: endDate };
    }
    
    // Filter berdasarkan kelas
    if (kelas) {
      query.kelas = kelas;
    }
    
    // Filter berdasarkan mata pelajaran
    if (mataPelajaran) {
      query.mataPelajaran = mataPelajaran;
    }
    
    // Filter berdasarkan status
    if (status) {
      query.status = status;
    }
    
    // Filter berdasarkan semester
    if (semester) {
      query.semester = semester;
    }
    
    // Filter berdasarkan tahun ajaran
    if (tahunAjaran) {
      query.tahunAjaran = tahunAjaran;
    }
    
    // Jika guru, hanya bisa lihat absen mata pelajarannya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const skip = (page - 1) * limit;
    
    const absen = await Absen.find(query)
      .populate('siswa', 'nis nama kelas jurusan')
      .populate('guru', 'nama')
      .sort({ tanggal: -1, jamMasuk: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Absen.countDocuments(query);
    
    res.json({
      absen,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get absen error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get absen berdasarkan ID
router.get('/:id', auth, async (req, res) => {
  try {
    const absen = await Absen.findById(req.params.id)
      .populate('siswa', 'nis nama kelas jurusan')
      .populate('guru', 'nama');
    
    if (!absen) {
      return res.status(404).json({ message: 'Data absen tidak ditemukan' });
    }
    
    res.json(absen);
    
  } catch (error) {
    console.error('Get absen by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tambah absen baru (admin/guru)
router.post('/', auth, [
  body('siswa').notEmpty().withMessage('ID siswa harus diisi'),
  body('status').isIn(['Hadir', 'Sakit', 'Izin', 'Alpha']).withMessage('Status tidak valid'),
  body('mataPelajaran').notEmpty().withMessage('Mata pelajaran harus diisi'),
  body('semester').notEmpty().withMessage('Semester harus diisi'),
  body('tahunAjaran').notEmpty().withMessage('Tahun ajaran harus diisi')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      siswa,
      status,
      keterangan,
      jamMasuk,
      jamKeluar,
      mataPelajaran,
      semester,
      tahunAjaran
    } = req.body;
    
    // Cek apakah siswa ada
    const siswaExists = await Siswa.findById(siswa);
    if (!siswaExists) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    
    // Cek apakah sudah ada absen untuk siswa ini pada tanggal dan mata pelajaran yang sama
    const existingAbsen = await Absen.findOne({
      siswa,
      tanggal: { $gte: new Date().setHours(0, 0, 0, 0) },
      mataPelajaran
    });
    
    if (existingAbsen) {
      return res.status(400).json({ message: 'Siswa sudah diabsen untuk mata pelajaran ini hari ini' });
    }
    
    const absen = new Absen({
      siswa,
      status,
      keterangan,
      jamMasuk: jamMasuk || new Date(),
      jamKeluar,
      mataPelajaran,
      guru: req.user._id,
      semester,
      tahunAjaran
    });
    
    await absen.save();
    
    const populatedAbsen = await Absen.findById(absen._id)
      .populate('siswa', 'nis nama kelas jurusan')
      .populate('guru', 'nama');
    
    res.status(201).json({
      message: 'Absen berhasil ditambahkan',
      absen: populatedAbsen
    });
    
  } catch (error) {
    console.error('Add absen error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update absen (admin/guru)
router.put('/:id', auth, [
  body('status').isIn(['Hadir', 'Sakit', 'Izin', 'Alpha']).withMessage('Status tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      status,
      keterangan,
      jamMasuk,
      jamKeluar
    } = req.body;
    
    const absen = await Absen.findById(req.params.id);
    
    if (!absen) {
      return res.status(404).json({ message: 'Data absen tidak ditemukan' });
    }
    
    // Jika guru, cek apakah absen ini miliknya
    if (req.user.role === 'guru' && absen.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedAbsen = await Absen.findByIdAndUpdate(
      req.params.id,
      {
        status,
        keterangan,
        jamMasuk,
        jamKeluar
      },
      { new: true }
    ).populate('siswa', 'nis nama kelas jurusan')
     .populate('guru', 'nama');
    
    res.json({
      message: 'Absen berhasil diupdate',
      absen: updatedAbsen
    });
    
  } catch (error) {
    console.error('Update absen error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Hapus absen (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const absen = await Absen.findByIdAndDelete(req.params.id);
    
    if (!absen) {
      return res.status(404).json({ message: 'Data absen tidak ditemukan' });
    }
    
    res.json({ message: 'Absen berhasil dihapus' });
    
  } catch (error) {
    console.error('Delete absen error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk absen untuk satu kelas (admin/guru)
router.post('/bulk', auth, [
  body('kelas').notEmpty().withMessage('Kelas harus diisi'),
  body('mataPelajaran').notEmpty().withMessage('Mata pelajaran harus diisi'),
  body('semester').notEmpty().withMessage('Semester harus diisi'),
  body('tahunAjaran').notEmpty().withMessage('Tahun ajaran harus diisi'),
  body('absenData').isArray().withMessage('Data absen harus berupa array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { kelas, mataPelajaran, semester, tahunAjaran, absenData } = req.body;
    
    // Cek apakah ada siswa di kelas tersebut
    const siswaKelas = await Siswa.find({ kelas, status: 'Aktif' });
    if (siswaKelas.length === 0) {
      return res.status(404).json({ message: 'Tidak ada siswa aktif di kelas tersebut' });
    }
    
    const absenArray = [];
    const today = new Date();
    
    for (const data of absenData) {
      const { siswaId, status, keterangan } = data;
      
      // Cek apakah siswa ada di kelas tersebut
      const siswa = siswaKelas.find(s => s._id.toString() === siswaId);
      if (!siswa) continue;
      
      // Cek apakah sudah ada absen
      const existingAbsen = await Absen.findOne({
        siswa: siswaId,
        tanggal: { $gte: new Date(today.setHours(0, 0, 0, 0)) },
        mataPelajaran
      });
      
      if (!existingAbsen) {
        absenArray.push({
          siswa: siswaId,
          status: status || 'Hadir',
          keterangan,
          jamMasuk: new Date(),
          mataPelajaran,
          guru: req.user._id,
          semester,
          tahunAjaran
        });
      }
    }
    
    if (absenArray.length > 0) {
      await Absen.insertMany(absenArray);
    }
    
    res.status(201).json({
      message: `${absenArray.length} data absen berhasil ditambahkan`,
      totalAdded: absenArray.length
    });
    
  } catch (error) {
    console.error('Bulk absen error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistik absen (admin/guru)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { tanggal, kelas, mataPelajaran, semester, tahunAjaran } = req.query;
    
    let query = {};
    
    if (tanggal) {
      const startDate = new Date(tanggal);
      const endDate = new Date(tanggal);
      endDate.setDate(endDate.getDate() + 1);
      query.tanggal = { $gte: startDate, $lt: endDate };
    }
    
    if (kelas) query.kelas = kelas;
    if (mataPelajaran) query.mataPelajaran = mataPelajaran;
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa lihat statistik mata pelajarannya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const totalAbsen = await Absen.countDocuments(query);
    const hadir = await Absen.countDocuments({ ...query, status: 'Hadir' });
    const sakit = await Absen.countDocuments({ ...query, status: 'Sakit' });
    const izin = await Absen.countDocuments({ ...query, status: 'Izin' });
    const alpha = await Absen.countDocuments({ ...query, status: 'Alpha' });
    
    // Statistik berdasarkan kelas
    const statistikKelas = await Absen.aggregate([
      { $match: query },
      { $group: { _id: '$kelas', total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Statistik berdasarkan mata pelajaran
    const statistikMapel = await Absen.aggregate([
      { $match: query },
      { $group: { _id: '$mataPelajaran', total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalAbsen,
      hadir,
      sakit,
      izin,
      alpha,
      statistikKelas,
      statistikMapel
    });
    
  } catch (error) {
    console.error('Get absen stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export absen ke CSV (admin/guru)
router.get('/export/csv', auth, async (req, res) => {
  try {
    const { tanggal, kelas, mataPelajaran, semester, tahunAjaran } = req.query;
    
    let query = {};
    
    if (tanggal) {
      const startDate = new Date(tanggal);
      const endDate = new Date(tanggal);
      endDate.setDate(endDate.getDate() + 1);
      query.tanggal = { $gte: startDate, $lt: endDate };
    }
    
    if (kelas) query.kelas = kelas;
    if (mataPelajaran) query.mataPelajaran = mataPelajaran;
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa export mata pelajarannya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const absen = await Absen.find(query)
      .populate('siswa', 'nis nama kelas jurusan')
      .populate('guru', 'nama')
      .sort({ tanggal: 1, jamMasuk: 1 });
    
    let csv = 'Tanggal,NIS,Nama,Kelas,Jurusan,Mata Pelajaran,Status,Jam Masuk,Jam Keluar,Keterangan,Guru\n';
    
    absen.forEach(a => {
      csv += `"${a.tanggal.toLocaleDateString('id-ID')}","${a.siswa.nis}","${a.siswa.nama}","${a.siswa.kelas}","${a.siswa.jurusan || ''}","${a.mataPelajaran}","${a.status}","${a.jamMasuk ? a.jamMasuk.toLocaleTimeString('id-ID') : ''}","${a.jamKeluar ? a.jamKeluar.toLocaleTimeString('id-ID') : ''}","${a.keterangan || ''}","${a.guru.nama}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=rekap-absen.csv');
    res.send(csv);
    
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;