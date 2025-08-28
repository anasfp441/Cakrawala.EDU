const express = require('express');
const { body, validationResult } = require('express-validator');
const Nilai = require('../models/Nilai');
const Siswa = require('../models/Siswa');
const { auth, adminOnly } = require('./auth');
const router = express.Router();

// Get semua nilai
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, siswa, mataPelajaran, kelas, jurusan, semester, tahunAjaran } = req.query;
    
    let query = {};
    
    // Filter berdasarkan siswa
    if (siswa) {
      query.siswa = siswa;
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
    
    // Jika siswa, hanya bisa lihat nilai miliknya
    if (req.user.role === 'siswa') {
      query.siswa = req.user._id;
    }
    
    // Jika guru, hanya bisa lihat nilai mata pelajaran yang diajar
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const skip = (page - 1) * limit;
    
    const nilai = await Nilai.find(query)
      .populate('siswa', 'nis nama kelas jurusan')
      .populate('guru', 'nama')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Nilai.countDocuments(query);
    
    res.json({
      nilai,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Get nilai error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nilai berdasarkan ID
router.get('/:id', auth, async (req, res) => {
  try {
    const nilai = await Nilai.findById(req.params.id)
      .populate('siswa', 'nis nama kelas jurusan')
      .populate('guru', 'nama');
    
    if (!nilai) {
      return res.status(404).json({ message: 'Data nilai tidak ditemukan' });
    }
    
    // Jika siswa, cek apakah nilai ini miliknya
    if (req.user.role === 'siswa' && nilai.siswa.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Jika guru, cek apakah nilai ini milik mata pelajaran yang diajar
    if (req.user.role === 'guru' && nilai.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(nilai);
    
  } catch (error) {
    console.error('Get nilai by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tambah nilai baru (guru/admin)
router.post('/', auth, [
  body('siswa').notEmpty().withMessage('ID siswa harus diisi'),
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
      siswa,
      mataPelajaran,
      kelas,
      jurusan,
      semester,
      tahunAjaran,
      nilaiTugas,
      nilaiUjian,
      nilaiPraktikum,
      bobotTugas,
      bobotUjian,
      bobotPraktikum,
      keterangan
    } = req.body;
    
    // Cek apakah siswa ada
    const siswaExists = await Siswa.findById(siswa);
    if (!siswaExists) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    
    // Cek apakah sudah ada nilai untuk siswa, mata pelajaran, kelas, semester, dan tahun ajaran yang sama
    const existingNilai = await Nilai.findOne({
      siswa,
      mataPelajaran,
      kelas,
      semester,
      tahunAjaran
    });
    
    if (existingNilai) {
      return res.status(400).json({ message: 'Nilai untuk siswa ini sudah ada' });
    }
    
    const nilai = new Nilai({
      siswa,
      mataPelajaran,
      kelas,
      jurusan,
      semester,
      tahunAjaran,
      guru: req.user._id,
      nilaiTugas,
      nilaiUjian,
      nilaiPraktikum,
      bobotTugas: bobotTugas || 30,
      bobotUjian: bobotUjian || 60,
      bobotPraktikum: bobotPraktikum || 10,
      keterangan
    });
    
    await nilai.save();
    
    const populatedNilai = await Nilai.findById(nilai._id)
      .populate('siswa', 'nis nama kelas jurusan')
      .populate('guru', 'nama');
    
    res.status(201).json({
      message: 'Nilai berhasil ditambahkan',
      nilai: populatedNilai
    });
    
  } catch (error) {
    console.error('Add nilai error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update nilai (guru/admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      nilaiTugas,
      nilaiUjian,
      nilaiPraktikum,
      bobotTugas,
      bobotUjian,
      bobotPraktikum,
      keterangan
    } = req.body;
    
    const existingNilai = await Nilai.findById(req.params.id);
    
    if (!existingNilai) {
      return res.status(404).json({ message: 'Data nilai tidak ditemukan' });
    }
    
    // Jika guru, cek apakah nilai ini milik mata pelajaran yang diajar
    if (req.user.role === 'guru' && existingNilai.guru.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedNilai = await Nilai.findByIdAndUpdate(
      req.params.id,
      {
        nilaiTugas,
        nilaiUjian,
        nilaiPraktikum,
        bobotTugas,
        bobotUjian,
        bobotPraktikum,
        keterangan
      },
      { new: true }
    ).populate('siswa', 'nis nama kelas jurusan')
     .populate('guru', 'nama');
    
    res.json({
      message: 'Nilai berhasil diupdate',
      nilai: updatedNilai
    });
    
  } catch (error) {
    console.error('Update nilai error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Hapus nilai (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const nilai = await Nilai.findByIdAndDelete(req.params.id);
    
    if (!nilai) {
      return res.status(404).json({ message: 'Data nilai tidak ditemukan' });
    }
    
    res.json({ message: 'Nilai berhasil dihapus' });
    
  } catch (error) {
    console.error('Delete nilai error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nilai siswa berdasarkan mata pelajaran
router.get('/siswa/:siswaId', auth, async (req, res) => {
  try {
    const { siswaId } = req.params;
    const { semester, tahunAjaran } = req.query;
    
    let query = { siswa: siswaId };
    
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika siswa, cek apakah nilai ini miliknya
    if (req.user.role === 'siswa' && siswaId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const nilai = await Nilai.find(query)
      .populate('guru', 'nama')
      .sort({ mataPelajaran: 1 });
    
    res.json(nilai);
    
  } catch (error) {
    console.error('Get nilai siswa error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nilai berdasarkan mata pelajaran dan kelas
router.get('/mapel/:mataPelajaran', auth, async (req, res) => {
  try {
    const { mataPelajaran } = req.params;
    const { kelas, jurusan, semester, tahunAjaran } = req.query;
    
    let query = { mataPelajaran };
    
    if (kelas) query.kelas = kelas;
    if (jurusan) query.jurusan = jurusan;
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa lihat nilai mata pelajaran yang diajar
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const nilai = await Nilai.find(query)
      .populate('siswa', 'nis nama kelas jurusan')
      .sort({ 'siswa.nama': 1 });
    
    res.json(nilai);
    
  } catch (error) {
    console.error('Get nilai by mapel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get rapor siswa
router.get('/rapor/:siswaId', auth, async (req, res) => {
  try {
    const { siswaId } = req.params;
    const { semester, tahunAjaran } = req.query;
    
    let query = { siswa: siswaId };
    
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika siswa, cek apakah rapor ini miliknya
    if (req.user.role === 'siswa' && siswaId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const nilai = await Nilai.find(query)
      .populate('guru', 'nama')
      .sort({ mataPelajaran: 1 });
    
    // Hitung rata-rata dan total nilai
    let totalNilai = 0;
    let totalBobot = 0;
    let jumlahMapel = nilai.length;
    
    nilai.forEach(n => {
      if (n.nilaiAkhir) {
        totalNilai += n.nilaiAkhir;
        totalBobot += 1;
      }
    });
    
    const rataRata = totalBobot > 0 ? totalNilai / totalBobot : 0;
    
    // Tentukan ranking (jika ada data kelas)
    let ranking = null;
    if (nilai.length > 0) {
      const kelas = nilai[0].kelas;
      const semester = nilai[0].semester;
      const tahunAjaran = nilai[0].tahunAjaran;
      
      const semuaNilaiKelas = await Nilai.find({
        kelas,
        semester,
        tahunAjaran
      }).populate('siswa', 'nis nama');
      
      // Hitung rata-rata setiap siswa
      const rataRataSiswa = {};
      semuaNilaiKelas.forEach(n => {
        if (!rataRataSiswa[n.siswa._id]) {
          rataRataSiswa[n.siswa._id] = { total: 0, count: 0, nama: n.siswa.nama };
        }
        if (n.nilaiAkhir) {
          rataRataSiswa[n.siswa._id].total += n.nilaiAkhir;
          rataRataSiswa[n.siswa._id].count += 1;
        }
      });
      
      // Urutkan berdasarkan rata-rata
      const sortedSiswa = Object.values(rataRataSiswa)
        .map(s => ({ ...s, rataRata: s.count > 0 ? s.total / s.count : 0 }))
        .sort((a, b) => b.rataRata - a.rataRata);
      
      // Cari ranking siswa
      const siswaIndex = sortedSiswa.findIndex(s => s.nama === nilai[0].siswa.nama);
      if (siswaIndex !== -1) {
        ranking = siswaIndex + 1;
      }
    }
    
    res.json({
      nilai,
      rataRata: Math.round(rataRata * 100) / 100,
      jumlahMapel,
      ranking,
      semester: nilai[0]?.semester,
      tahunAjaran: nilai[0]?.tahunAjaran
    });
    
  } catch (error) {
    console.error('Get rapor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistik nilai (admin/guru)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    
    let query = {};
    
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa lihat statistik nilai mata pelajaran yang diajar
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const totalNilai = await Nilai.countDocuments(query);
    
    // Statistik berdasarkan grade
    const statistikGrade = await Nilai.aggregate([
      { $match: query },
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Statistik berdasarkan mata pelajaran
    const statistikMapel = await Nilai.aggregate([
      { $match: query },
      { $group: { _id: '$mataPelajaran', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Statistik berdasarkan kelas
    const statistikKelas = await Nilai.aggregate([
      { $match: query },
      { $group: { _id: '$kelas', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Rata-rata nilai berdasarkan mata pelajaran
    const rataRataMapel = await Nilai.aggregate([
      { $match: query },
      { $group: { 
        _id: '$mataPelajaran', 
        rataRata: { $avg: '$nilaiAkhir' },
        count: { $sum: 1 }
      }},
      { $sort: { rataRata: -1 } }
    ]);
    
    res.json({
      totalNilai,
      statistikGrade,
      statistikMapel,
      statistikKelas,
      rataRataMapel
    });
    
  } catch (error) {
    console.error('Get nilai stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export nilai ke CSV (admin/guru)
router.get('/export/csv', auth, async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    
    let query = {};
    
    if (semester) query.semester = semester;
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    
    // Jika guru, hanya bisa export nilai mata pelajaran yang diajar
    if (req.user.role === 'guru') {
      query.guru = req.user._id;
    }
    
    const nilai = await Nilai.find(query)
      .populate('siswa', 'nis nama kelas jurusan')
      .populate('guru', 'nama')
      .sort({ 'siswa.nama': 1, mataPelajaran: 1 });
    
    let csv = 'NIS,Nama,Kelas,Jurusan,Mata Pelajaran,Semester,Tahun Ajaran,Nilai Tugas,Nilai Ujian,Nilai Praktikum,Nilai Akhir,Grade,Guru,Keterangan\n';
    
    nilai.forEach(n => {
      csv += `"${n.siswa.nis}","${n.siswa.nama}","${n.siswa.kelas}","${n.siswa.jurusan || ''}","${n.mataPelajaran}","${n.semester}","${n.tahunAjaran}","${n.nilaiTugas || ''}","${n.nilaiUjian || ''}","${n.nilaiPraktikum || ''}","${n.nilaiAkhir || ''}","${n.grade || ''}","${n.guru ? n.guru.nama : ''}","${n.keterangan || ''}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=daftar-nilai.csv');
    res.send(csv);
    
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;