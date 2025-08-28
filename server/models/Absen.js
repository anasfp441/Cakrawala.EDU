const mongoose = require('mongoose');

const absenSchema = new mongoose.Schema({
  siswa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Siswa',
    required: true
  },
  tanggal: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Hadir', 'Sakit', 'Izin', 'Alpha'],
    required: true
  },
  keterangan: String,
  jamMasuk: Date,
  jamKeluar: Date,
  mataPelajaran: String,
  guru: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  semester: {
    type: String,
    required: true
  },
  tahunAjaran: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index untuk mencegah duplikasi absen
absenSchema.index({ siswa: 1, tanggal: 1, mataPelajaran: 1 }, { unique: true });

module.exports = mongoose.model('Absen', absenSchema);