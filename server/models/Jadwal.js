const mongoose = require('mongoose');

const jadwalSchema = new mongoose.Schema({
  hari: {
    type: String,
    enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    required: true
  },
  jamMulai: {
    type: String,
    required: true
  },
  jamSelesai: {
    type: String,
    required: true
  },
  mataPelajaran: {
    type: String,
    required: true
  },
  kelas: {
    type: String,
    required: true
  },
  jurusan: String,
  guru: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ruangan: String,
  semester: {
    type: String,
    required: true
  },
  tahunAjaran: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index untuk optimasi query
jadwalSchema.index({ hari: 1, kelas: 1, semester: 1, tahunAjaran: 1 });

module.exports = mongoose.model('Jadwal', jadwalSchema);