const express = require('express');
const { body, validationResult } = require('express-validator');
const Materi = require('../models/Materi');
const { auth, adminOnly } = require('./auth');
const router = express.Router();

// Get semua materi
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, mataPelajaran, kelas, jurusan, semester, tahunAjaran, isPublished } = req.query;
    
    let query = {};
    
    // Filter berdasarkan search
    if (search) {
      query.$text = { $search: search };
    }
    
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
    
    // Filter berdasarkan status publish
    if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }
    
    // Jika siswa, hanya bisa lihat materi yang sudah dipublish
    if (req.user.role === 'siswa') {
      query.isPublished = true;
    }
    
    // Jika guru, hanya bisa lihat materi miliknya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const skip = (page - 1) * limit;
    
    const materi = await Materi.find(query)
      .populate('guru', 'nama')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Materi.countDocuments(query);
    
    res.json({
      materi,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get materi error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get materi berdasarkan ID
router.get('/:id', auth, async (req, res) => {
  try {
    const materi = await Materi.findById(req.params.id)
      .populate('guru', 'nama');
    
    if (!materi) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }
    
    // Jika siswa, cek apakah materi sudah dipublish
    if (req.user.role === 'siswa' && !materi.isPublished) {
      return res.status(403).json({ message: 'Materi belum dipublish' });
    }
    
    // Update view count
    materi.views += 1;
    await materi.save();
    
    res.json(materi);
    
  } catch (error) {
    console.error('Get materi by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tambah materi baru (guru/admin)
router.post('/', auth, [
  body('judul').notEmpty().withMessage('Judul harus diisi'),
  body('konten').notEmpty().withMessage('Konten harus diisi'),
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
      judul,
      deskripsi,
      konten,
      file,
      linkVideo,
      mataPelajaran,
      kelas,
      jurusan,
      semester,
      tahunAjaran,
      tags,
      isPublished
    } = req.body;
    
    const materi = new Materi({
      judul,
      deskripsi,
      konten,
      file,
      linkVideo,
      mataPelajaran,
      kelas,
      jurusan,
      semester,
      tahunAjaran,
      guru: req.user._id,
      tags: tags || [],
      isPublished: isPublished || false,
      tanggalPublish: isPublished ? new Date() : null
    });
    
    await materi.save();
    
    const populatedMateri = await Materi.findById(materi._id)
      .populate('guru', 'nama');
    
    res.status(201).json({
      message: 'Materi berhasil ditambahkan',
      materi: populatedMateri
    });
    
  } catch (error) {
    console.error('Add materi error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update materi (guru/admin)
router.put('/:id', auth, [
  body('judul').notEmpty().withMessage('Judul harus diisi'),
  body('konten').notEmpty().withMessage('Konten harus diisi')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      judul,
      deskripsi,
      konten,
      file,
      linkVideo,
      tags
    } = req.body;
    
    const existingMateri = await Materi.findById(req.params.id);
    
    if (!existingMateri) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }
    
    // Jika guru, cek apakah materi ini miliknya
    if (req.user.role === 'guru' && existingMateri.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedMateri = await Materi.findByIdAndUpdate(
      req.params.id,
      {
        judul,
        deskripsi,
        konten,
        file,
        linkVideo,
        tags
      },
      { new: true }
    ).populate('guru', 'nama');
    
    res.json({
      message: 'Materi berhasil diupdate',
      materi: updatedMateri
    });
    
  } catch (error) {
    console.error('Update materi error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Hapus materi (guru/admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const materi = await Materi.findById(req.params.id);
    
    if (!materi) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }
    
    // Jika guru, cek apakah materi ini miliknya
    if (req.user.role === 'guru' && materi.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Materi.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Materi berhasil dihapus' });
    
  } catch (error) {
    console.error('Delete materi error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Publish/unpublish materi (guru/admin)
router.patch('/:id/publish', auth, async (req, res) => {
  try {
    const { isPublished } = req.body;
    
    const materi = await Materi.findById(req.params.id);
    
    if (!materi) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }
    
    // Jika guru, cek apakah materi ini miliknya
    if (req.user.role === 'guru' && materi.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    materi.isPublished = isPublished;
    materi.tanggalPublish = isPublished ? new Date() : null;
    
    await materi.save();
    
    res.json({
      message: `Materi berhasil ${isPublished ? 'dipublish' : 'diunpublish'}`,
      materi
    });
    
  } catch (error) {
    console.error('Publish materi error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download materi (update download count)
router.post('/:id/download', auth, async (req, res) => {
  try {
    const materi = await Materi.findById(req.params.id);
    
    if (!materi) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }
    
    // Jika siswa, cek apakah materi sudah dipublish
    if (req.user.role === 'siswa' && !materi.isPublished) {
      return res.status(403).json({ message: 'Materi belum dipublish' });
    }
    
    // Update download count
    materi.downloads += 1;
    await materi.save();
    
    res.json({ message: 'Download count berhasil diupdate' });
    
  } catch (error) {
    console.error('Download materi error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get materi berdasarkan mata pelajaran dan kelas
router.get('/mapel/:mataPelajaran', auth, async (req, res) => {
  try {
    const { mataPelajaran } = req.params;
    const { kelas, jurusan, semester, tahunAjaran } = req.query;
    
    let query = {
      mataPelajaran,
      isPublished: true
    };
    
    if (kelas) query.kelas = kelas;
    if (jurusan) query.jurusan = jurusan;
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    const materi = await Materi.find(query)
      .populate('guru', 'nama')
      .sort({ createdAt: -1 });
    
    res.json(materi);
    
  } catch (error) {
    console.error('Get materi by mapel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistik materi (admin/guru)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    
    let query = {};
    
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa lihat statistik materi miliknya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const totalMateri = await Materi.countDocuments(query);
    const materiPublished = await Materi.countDocuments({ ...query, isPublished: true });
    const materiDraft = await Materi.countDocuments({ ...query, isPublished: false });
    
    // Statistik berdasarkan mata pelajaran
    const statistikMapel = await Materi.aggregate([
      { $match: query },
      { $group: { _id: '$mataPelajaran', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Statistik berdasarkan kelas
    const statistikKelas = await Materi.aggregate([
      { $match: query },
      { $group: { _id: '$kelas', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Top materi berdasarkan views
    const topMateriViews = await Materi.find(query)
      .sort({ views: -1 })
      .limit(5)
      .select('judul views');
    
    // Top materi berdasarkan downloads
    const topMateriDownloads = await Materi.find(query)
      .sort({ downloads: -1 })
      .limit(5)
      .select('judul downloads');
    
    res.json({
      totalMateri,
      materiPublished,
      materiDraft,
      statistikMapel,
      statistikKelas,
      topMateriViews,
      topMateriDownloads
    });
    
  } catch (error) {
    console.error('Get materi stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search materi (full-text search)
router.get('/search/advanced', auth, async (req, res) => {
  try {
    const { q, mataPelajaran, kelas, jurusan, semester, tahunAjaran, tags } = req.query;
    
    let query = {};
    
    // Full-text search
    if (q) {
      query.$text = { $search: q };
    }
    
    // Filter lainnya
    if (mataPelajaran) query.mataPelajaran = mataPelajaran;
    if (kelas) query.kelas = kelas;
    if (jurusan) query.jurusan = jurusan;
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    if (tags) query.tags = { $in: tags.split(',') };
    
    // Jika siswa, hanya bisa lihat materi yang sudah dipublish
    if (req.user.role === 'siswa') {
      query.isPublished = true;
    }
    
    const materi = await Materi.find(query)
      .populate('guru', 'nama')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
    
    res.json(materi);
    
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export materi ke CSV (admin/guru)
router.get('/export/csv', auth, async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    
    let query = {};
    
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa export materi miliknya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const materi = await Materi.find(query)
      .populate('guru', 'nama')
      .sort({ createdAt: -1 });
    
    let csv = 'Judul,Deskripsi,Mata Pelajaran,Kelas,Jurusan,Semester,Tahun Ajaran,Guru,Status,Views,Downloads,Tanggal Dibuat\n';
    
    materi.forEach(m => {
      csv += `"${m.judul}","${m.deskripsi || ''}","${m.mataPelajaran}","${m.kelas}","${m.jurusan || ''}","${m.semester}","${m.tahunAjaran}","${m.guru ? m.guru.nama : ''}","${m.isPublished ? 'Published' : 'Draft}","${m.views}","${m.downloads}","${m.createdAt.toLocaleDateString('id-ID')}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=daftar-materi.csv');
    res.send(csv);
    
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;