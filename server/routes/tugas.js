const express = require('express');
const { body, validationResult } = require('express-validator');
const Tugas = require('../models/Tugas');
const { auth, adminOnly } = require('./auth');
const router = express.Router();

// Get semua tugas
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, mataPelajaran, kelas, jurusan, semester, tahunAjaran, status } = req.query;
    
    let query = {};
    
    // Filter berdasarkan mata pelajaran
    if (mataPelajaran) {
      query.mataPelajaran = mataPelajaran;
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
    
    // Filter berdasarkan status
    if (status) {
      query.status = status;
    }
    
    // Jika siswa, hanya bisa lihat tugas yang sudah dipublish
    if (req.user.role === 'siswa') {
      query.status = 'Published';
      query.isActive = true;
    }
    
    // Jika guru, hanya bisa lihat tugas miliknya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const skip = (page - 1) * limit;
    
    const tugas = await Tugas.find(query)
      .populate('guru', 'nama')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Tugas.countDocuments(query);
    
    res.json({
      tugas,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get tugas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tugas berdasarkan ID
router.get('/:id', auth, async (req, res) => {
  try {
    const tugas = await Tugas.findById(req.params.id)
      .populate('guru', 'nama');
    
    if (!tugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }
    
    // Jika siswa, cek apakah tugas sudah dipublish
    if (req.user.role === 'siswa' && tugas.status !== 'Published') {
      return res.status(403).json({ message: 'Tugas belum dipublish' });
    }
    
    res.json(tugas);
    
  } catch (error) {
    console.error('Get tugas by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tambah tugas baru (guru/admin)
router.post('/', auth, [
  body('judul').notEmpty().withMessage('Judul harus diisi'),
  body('mataPelajaran').notEmpty().withMessage('Mata pelajaran harus diisi'),
  body('kelas').notEmpty().withMessage('Kelas harus diisi'),
  body('semester').notEmpty().withMessage('Semester harus diisi'),
  body('tahunAjaran').notEmpty().withMessage('Tahun ajaran harus diisi'),
  body('deadline').notEmpty().withMessage('Deadline harus diisi')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      judul,
      deskripsi,
      instruksi,
      fileLampiran,
      mataPelajaran,
      kelas,
      jurusan,
      semester,
      tahunAjaran,
      deadline,
      bobot,
      status
    } = req.body;
    
    const tugas = new Tugas({
      judul,
      deskripsi,
      instruksi,
      fileLampiran,
      mataPelajaran,
      kelas,
      jurusan,
      semester,
      tahunAjaran,
      guru: req.user._id,
      deadline: new Date(deadline),
      bobot: bobot || 10,
      status: status || 'Draft'
    });
    
    await tugas.save();
    
    const populatedTugas = await Tugas.findById(tugas._id)
      .populate('guru', 'nama');
    
    res.status(201).json({
      message: 'Tugas berhasil ditambahkan',
      tugas: populatedTugas
    });
    
  } catch (error) {
    console.error('Add tugas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tugas (guru/admin)
router.put('/:id', auth, [
  body('judul').notEmpty().withMessage('Judul harus diisi')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      judul,
      deskripsi,
      instruksi,
      fileLampiran,
      deadline,
      bobot
    } = req.body;
    
    const existingTugas = await Tugas.findById(req.params.id);
    
    if (!existingTugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }
    
    // Jika guru, cek apakah tugas ini miliknya
    if (req.user.role === 'guru' && existingTugas.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedTugas = await Tugas.findByIdAndUpdate(
      req.params.id,
      {
        judul,
        deskripsi,
        instruksi,
        fileLampiran,
        deadline: deadline ? new Date(deadline) : existingTugas.deadline,
        bobot
      },
      { new: true }
    ).populate('guru', 'nama');
    
    res.json({
      message: 'Tugas berhasil diupdate',
      tugas: updatedTugas
    });
    
  } catch (error) {
    console.error('Update tugas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Hapus tugas (guru/admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const tugas = await Tugas.findById(req.params.id);
    
    if (!tugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }
    
    // Jika guru, cek apakah tugas ini miliknya
    if (req.user.role === 'guru' && tugas.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Tugas.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Tugas berhasil dihapus' });
    
  } catch (error) {
    console.error('Delete tugas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update status tugas (guru/admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Draft', 'Published', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }
    
    const tugas = await Tugas.findById(req.params.id);
    
    if (!tugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }
    
    // Jika guru, cek apakah tugas ini miliknya
    if (req.user.role === 'guru' && tugas.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    tugas.status = status;
    await tugas.save();
    
    res.json({
      message: `Status tugas berhasil diubah menjadi ${status}`,
      tugas
    });
    
  } catch (error) {
    console.error('Update status tugas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle aktif/nonaktif tugas (guru/admin)
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const tugas = await Tugas.findById(req.params.id);
    
    if (!tugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }
    
    // Jika guru, cek apakah tugas ini miliknya
    if (req.user.role === 'guru' && tugas.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    tugas.isActive = !tugas.isActive;
    await tugas.save();
    
    res.json({
      message: `Tugas berhasil ${tugas.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      tugas
    });
    
  } catch (error) {
    console.error('Toggle tugas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tugas berdasarkan mata pelajaran dan kelas
router.get('/mapel/:mataPelajaran', auth, async (req, res) => {
  try {
    const { mataPelajaran } = req.params;
    const { kelas, jurusan, semester, tahunAjaran } = req.query;
    
    let query = {
      mataPelajaran,
      status: 'Published',
      isActive: true
    };
    
    if (kelas) query.kelas = kelas;
    if (jurusan) query.jurusan = jurusan;
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    const tugas = await Tugas.find(query)
      .populate('guru', 'nama')
      .sort({ createdAt: -1 });
    
    res.json(tugas);
    
  } catch (error) {
    console.error('Get tugas by mapel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tugas yang deadline-nya sudah lewat
router.get('/overdue', auth, async (req, res) => {
  try {
    const { mataPelajaran, kelas, jurusan, semester, tahunAjaran } = req.query;
    
    let query = {
      deadline: { $lt: new Date() },
      status: 'Published',
      isActive: true
    };
    
    if (mataPelajaran) query.mataPelajaran = mataPelajaran;
    if (kelas) query.kelas = kelas;
    if (jurusan) query.jurusan = jurusan;
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa lihat tugas miliknya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const tugas = await Tugas.find(query)
      .populate('guru', 'nama')
      .sort({ deadline: 1 });
    
    res.json(tugas);
    
  } catch (error) {
    console.error('Get overdue tugas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tugas yang deadline-nya hari ini
router.get('/today', auth, async (req, res) => {
  try {
    const { mataPelajaran, kelas, jurusan, semester, tahunAjaran } = req.query;
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    let query = {
      deadline: { $gte: startOfDay, $lt: endOfDay },
      status: 'Published',
      isActive: true
    };
    
    if (mataPelajaran) query.mataPelajaran = mataPelajaran;
    if (kelas) query.kelas = kelas;
    if (jurusan) query.jurusan = jurusan;
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa lihat tugas miliknya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const tugas = await Tugas.find(query)
      .populate('guru', 'nama')
      .sort({ deadline: 1 });
    
    res.json(tugas);
    
  } catch (error) {
    console.error('Get today tugas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistik tugas (admin/guru)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    
    let query = {};
    
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa lihat statistik tugas miliknya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const totalTugas = await Tugas.countDocuments(query);
    const tugasDraft = await Tugas.countDocuments({ ...query, status: 'Draft' });
    const tugasPublished = await Tugas.countDocuments({ ...query, status: 'Published' });
    const tugasClosed = await Tugas.countDocuments({ ...query, status: 'Closed' });
    
    // Tugas yang deadline-nya sudah lewat
    const tugasOverdue = await Tugas.countDocuments({
      ...query,
      deadline: { $lt: new Date() },
      status: 'Published'
    });
    
    // Statistik berdasarkan mata pelajaran
    const statistikMapel = await Tugas.aggregate([
      { $match: query },
      { $group: { _id: '$mataPelajaran', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Statistik berdasarkan kelas
    const statistikKelas = await Tugas.aggregate([
      { $match: query },
      { $group: { _id: '$kelas', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalTugas,
      tugasDraft,
      tugasPublished,
      tugasClosed,
      tugasOverdue,
      statistikMapel,
      statistikKelas
    });
    
  } catch (error) {
    console.error('Get tugas stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export tugas ke CSV (admin/guru)
router.get('/export/csv', auth, async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    
    let query = {};
    
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa export tugas miliknya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const tugas = await Tugas.find(query)
      .populate('guru', 'nama')
      .sort({ createdAt: -1 });
    
    let csv = 'Judul,Deskripsi,Mata Pelajaran,Kelas,Jurusan,Semester,Tahun Ajaran,Guru,Deadline,Bobot,Status,Tanggal Dibuat\n';
    
    tugas.forEach(t => {
      csv += `"${t.judul}","${t.deskripsi || ''}","${t.mataPelajaran}","${t.kelas}","${t.jurusan || ''}","${t.semester}","${t.tahunAjaran}","${t.guru ? t.guru.nama : ''}","${t.deadline.toLocaleDateString('id-ID')}","${t.bobot}","${t.status}","${t.createdAt.toLocaleDateString('id-ID')}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=daftar-tugas.csv');
    res.send(csv);
    
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;