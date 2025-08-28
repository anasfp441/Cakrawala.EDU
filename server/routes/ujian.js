const express = require('express');
const { body, validationResult } = require('express-validator');
const Ujian = require('../models/Ujian');
const Siswa = require('../models/Siswa');
const { auth, adminOnly } = require('./auth');
const router = express.Router();

// Get semua ujian
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
    
    // Jika siswa, hanya bisa lihat ujian yang sudah dipublish dan aktif
    if (req.user.role === 'siswa') {
      query.status = { $in: ['Published', 'Active'] };
    }
    
    // Jika guru, hanya bisa lihat ujian miliknya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const skip = (page - 1) * limit;
    
    const ujian = await Ujian.find(query)
      .populate('guru', 'nama')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Ujian.countDocuments(query);
    
    res.json({
      ujian,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get ujian error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ujian berdasarkan ID
router.get('/:id', auth, async (req, res) => {
  try {
    const ujian = await Ujian.findById(req.params.id)
      .populate('guru', 'nama');
    
    if (!ujian) {
      return res.status(404).json({ message: 'Ujian tidak ditemukan' });
    }
    
    // Jika siswa, cek apakah ujian sudah dipublish dan aktif
    if (req.user.role === 'siswa' && !['Published', 'Active'].includes(ujian.status)) {
      return res.status(403).json({ message: 'Ujian belum tersedia' });
    }
    
    res.json(ujian);
    
  } catch (error) {
    console.error('Get ujian by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tambah ujian baru (guru/admin)
router.post('/', auth, [
  body('judul').notEmpty().withMessage('Judul harus diisi'),
  body('mataPelajaran').notEmpty().withMessage('Mata pelajaran harus diisi'),
  body('kelas').notEmpty().withMessage('Kelas harus diisi'),
  body('semester').notEmpty().withMessage('Semester harus diisi'),
  body('tahunAjaran').notEmpty().withMessage('Tahun ajaran harus diisi'),
  body('tanggalUjian').notEmpty().withMessage('Tanggal ujian harus diisi'),
  body('durasi').isNumeric().withMessage('Durasi harus berupa angka'),
  body('soal').isArray().withMessage('Soal harus berupa array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      judul,
      deskripsi,
      mataPelajaran,
      kelas,
      jurusan,
      semester,
      tahunAjaran,
      tanggalUjian,
      durasi,
      soal,
      totalNilai,
      passingGrade,
      isRandom,
      isShuffle,
      status
    } = req.body;
    
    const ujian = new Ujian({
      judul,
      deskripsi,
      mataPelajaran,
      kelas,
      jurusan,
      semester,
      tahunAjaran,
      guru: req.user._id,
      tanggalUjian: new Date(tanggalUjian),
      durasi: parseInt(durasi),
      soal,
      totalNilai: totalNilai || 100,
      passingGrade: passingGrade || 70,
      isRandom: isRandom || false,
      isShuffle: isShuffle || false,
      status: status || 'Draft'
    });
    
    await ujian.save();
    
    const populatedUjian = await Ujian.findById(ujian._id)
      .populate('guru', 'nama');
    
    res.status(201).json({
      message: 'Ujian berhasil ditambahkan',
      ujian: populatedUjian
    });
    
  } catch (error) {
    console.error('Add ujian error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ujian (guru/admin)
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
      tanggalUjian,
      durasi,
      soal,
      totalNilai,
      passingGrade,
      isRandom,
      isShuffle
    } = req.body;
    
    const existingUjian = await Ujian.findById(req.params.id);
    
    if (!existingUjian) {
      return res.status(404).json({ message: 'Ujian tidak ditemukan' });
    }
    
    // Jika guru, cek apakah ujian ini miliknya
    if (req.user.role === 'guru' && existingUjian.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Tidak bisa update jika ujian sudah aktif atau selesai
    if (['Active', 'Completed'].includes(existingUjian.status)) {
      return res.status(400).json({ message: 'Tidak bisa mengupdate ujian yang sudah aktif atau selesai' });
    }
    
    const updatedUjian = await Ujian.findByIdAndUpdate(
      req.params.id,
      {
        judul,
        deskripsi,
        tanggalUjian: tanggalUjian ? new Date(tanggalUjian) : existingUjian.tanggalUjian,
        durasi: durasi ? parseInt(durasi) : existingUjian.durasi,
        soal,
        totalNilai,
        passingGrade,
        isRandom,
        isShuffle
      },
      { new: true }
    ).populate('guru', 'nama');
    
    res.json({
      message: 'Ujian berhasil diupdate',
      ujian: updatedUjian
    });
    
  } catch (error) {
    console.error('Update ujian error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Hapus ujian (guru/admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const ujian = await Ujian.findById(req.params.id);
    
    if (!ujian) {
      return res.status(404).json({ message: 'Ujian tidak ditemukan' });
    }
    
    // Jika guru, cek apakah ujian ini miliknya
    if (req.user.role === 'guru' && ujian.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Tidak bisa hapus jika ujian sudah aktif atau selesai
    if (['Active', 'Completed'].includes(ujian.status)) {
      return res.status(400).json({ message: 'Tidak bisa menghapus ujian yang sudah aktif atau selesai' });
    }
    
    await Ujian.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Ujian berhasil dihapus' });
    
  } catch (error) {
    console.error('Delete ujian error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update status ujian (guru/admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Draft', 'Published', 'Active', 'Completed', 'Archived'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }
    
    const ujian = await Ujian.findById(req.params.id);
    
    if (!ujian) {
      return res.status(404).json({ message: 'Ujian tidak ditemukan' });
    }
    
    // Jika guru, cek apakah ujian ini miliknya
    if (req.user.role === 'guru' && ujian.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Validasi transisi status
    if (status === 'Active' && ujian.status !== 'Published') {
      return res.status(400).json({ message: 'Hanya ujian yang sudah dipublish yang bisa diaktifkan' });
    }
    
    if (status === 'Completed' && ujian.status !== 'Active') {
      return res.status(400).json({ message: 'Hanya ujian yang sedang aktif yang bisa diselesaikan' });
    }
    
    ujian.status = status;
    
    // Set waktu mulai/selesai berdasarkan status
    if (status === 'Active') {
      ujian.waktuMulai = new Date();
    } else if (status === 'Completed') {
      ujian.waktuSelesai = new Date();
    }
    
    await ujian.save();
    
    res.json({
      message: `Status ujian berhasil diubah menjadi ${status}`,
      ujian
    });
    
  } catch (error) {
    console.error('Update status ujian error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mulai ujian (siswa)
router.post('/:id/start', auth, async (req, res) => {
  try {
    if (req.user.role !== 'siswa') {
      return res.status(403).json({ message: 'Hanya siswa yang bisa mulai ujian' });
    }
    
    const ujian = await Ujian.findById(req.params.id);
    
    if (!ujian) {
      return res.status(404).json({ message: 'Ujian tidak ditemukan' });
    }
    
    if (ujian.status !== 'Active') {
      return res.status(400).json({ message: 'Ujian belum aktif' });
    }
    
    // Cek apakah siswa sudah terdaftar sebagai peserta
    let peserta = ujian.peserta.find(p => p.siswa.toString() === req.user._id.toString());
    
    if (!peserta) {
      // Daftarkan siswa sebagai peserta
      peserta = {
        siswa: req.user._id,
        status: 'Sedang Ujian',
        waktuMulai: new Date(),
        jawaban: [],
        nilai: 0,
        isPassed: false
      };
      ujian.peserta.push(peserta);
    } else {
      // Update status peserta
      peserta.status = 'Sedang Ujian';
      peserta.waktuMulai = new Date();
    }
    
    await ujian.save();
    
    res.json({
      message: 'Ujian berhasil dimulai',
      waktuMulai: peserta.waktuMulai,
      durasi: ujian.durasi
    });
    
  } catch (error) {
    console.error('Start ujian error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit jawaban ujian (siswa)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    if (req.user.role !== 'siswa') {
      return res.status(403).json({ message: 'Hanya siswa yang bisa submit ujian' });
    }
    
    const { jawaban } = req.body;
    
    if (!Array.isArray(jawaban)) {
      return res.status(400).json({ message: 'Jawaban harus berupa array' });
    }
    
    const ujian = await Ujian.findById(req.params.id);
    
    if (!ujian) {
      return res.status(404).json({ message: 'Ujian tidak ditemukan' });
    }
    
    if (ujian.status !== 'Active') {
      return res.status(400).json({ message: 'Ujian tidak sedang aktif' });
    }
    
    // Cari peserta
    const peserta = ujian.peserta.find(p => p.siswa.toString() === req.user._id.toString());
    
    if (!peserta || peserta.status !== 'Sedang Ujian') {
      return res.status(400).json({ message: 'Anda belum memulai ujian' });
    }
    
    // Cek apakah waktu ujian sudah habis
    const waktuMulai = new Date(peserta.waktuMulai);
    const waktuSekarang = new Date();
    const durasiMenit = ujian.durasi;
    
    if ((waktuSekarang - waktuMulai) / (1000 * 60) > durasiMenit) {
      return res.status(400).json({ message: 'Waktu ujian sudah habis' });
    }
    
    // Update jawaban dan selesaikan ujian
    peserta.jawaban = jawaban;
    peserta.status = 'Selesai';
    peserta.waktuSelesai = waktuSekarang;
    
    // Hitung nilai (implementasi sederhana)
    let nilai = 0;
    let jawabanBenar = 0;
    
    jawaban.forEach((jawab, index) => {
      if (ujian.soal[index] && ujian.soal[index].jawabanBenar.includes(jawab)) {
        nilai += ujian.soal[index].bobot;
        jawabanBenar++;
      }
    });
    
    peserta.nilai = nilai;
    peserta.isPassed = nilai >= ujian.passingGrade;
    
    await ujian.save();
    
    res.json({
      message: 'Ujian berhasil diselesaikan',
      nilai,
      isPassed: peserta.isPassed,
      jawabanBenar: `${jawabanBenar}/${ujian.soal.length}`
    });
    
  } catch (error) {
    console.error('Submit ujian error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hasil ujian (siswa)
router.get('/:id/result', auth, async (req, res) => {
  try {
    const ujian = await Ujian.findById(req.params.id);
    
    if (!ujian) {
      return res.status(404).json({ message: 'Ujian tidak ditemukan' });
    }
    
    // Cari hasil peserta
    const peserta = ujian.peserta.find(p => p.siswa.toString() === req.user._id.toString());
    
    if (!peserta) {
      return res.status(404).json({ message: 'Anda belum mengikuti ujian ini' });
    }
    
    if (peserta.status !== 'Selesai') {
      return res.status(400).json({ message: 'Ujian belum selesai' });
    }
    
    res.json({
      nilai: peserta.nilai,
      isPassed: peserta.isPassed,
      waktuMulai: peserta.waktuMulai,
      waktuSelesai: peserta.waktuSelesai,
      durasi: ujian.durasi,
      totalSoal: ujian.soal.length,
      passingGrade: ujian.passingGrade
    });
    
  } catch (error) {
    console.error('Get ujian result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get daftar peserta ujian (guru/admin)
router.get('/:id/participants', auth, async (req, res) => {
  try {
    const ujian = await Ujian.findById(req.params.id)
      .populate('peserta.siswa', 'nis nama kelas jurusan');
    
    if (!ujian) {
      return res.status(404).json({ message: 'Ujian tidak ditemukan' });
    }
    
    // Jika guru, cek apakah ujian ini miliknya
    if (req.user.role === 'guru' && ujian.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(ujian.peserta);
    
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistik ujian (admin/guru)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    
    let query = {};
    
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa lihat statistik ujian miliknya
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const totalUjian = await Ujian.countDocuments(query);
    const ujianDraft = await Ujian.countDocuments({ ...query, status: 'Draft' });
    const ujianPublished = await Ujian.countDocuments({ ...query, status: 'Published' });
    const ujianActive = await Ujian.countDocuments({ ...query, status: 'Active' });
    const ujianCompleted = await Ujian.countDocuments({ ...query, status: 'Completed' });
    
    // Statistik berdasarkan mata pelajaran
    const statistikMapel = await Ujian.aggregate([
      { $match: query },
      { $group: { _id: '$mataPelajaran', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Statistik berdasarkan kelas
    const statistikKelas = await Ujian.aggregate([
      { $match: query },
      { $group: { _id: '$kelas', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalUjian,
      ujianDraft,
      ujianPublished,
      ujianActive,
      ujianCompleted,
      statistikMapel,
      statistikKelas
    });
    
  } catch (error) {
    console.error('Get ujian stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export hasil ujian ke CSV (guru/admin)
router.get('/:id/export-result', auth, async (req, res) => {
  try {
    const ujian = await Ujian.findById(req.params.id)
      .populate('peserta.siswa', 'nis nama kelas jurusan');
    
    if (!ujian) {
      return res.status(404).json({ message: 'Ujian tidak ditemukan' });
    }
    
    // Jika guru, cek apakah ujian ini miliknya
    if (req.user.role === 'guru' && ujian.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    let csv = 'NIS,Nama,Kelas,Jurusan,Status,Waktu Mulai,Waktu Selesai,Nilai,Lulus\n';
    
    ujian.peserta.forEach(p => {
      csv += `"${p.siswa.nis}","${p.siswa.nama}","${p.siswa.kelas}","${p.siswa.jurusan || ''}","${p.status}","${p.waktuMulai ? p.waktuMulai.toLocaleString('id-ID') : ''}","${p.waktuSelesai ? p.waktuSelesai.toLocaleString('id-ID') : ''}","${p.nilai || 0}","${p.isPassed ? 'Ya' : 'Tidak'}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=hasil-ujian-${ujian.judul}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;