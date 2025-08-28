const mongoose = require('mongoose');

const tugasSchema = new mongoose.Schema({
  judul: {
    type: String,
    required: true
  },
  deskripsi: String,
  instruksi: String,
  fileLampiran: String,
  mataPelajaran: {
    type: String,
    required: true
  },
  kelas: {
    type: String,
    required: true
  },
  jurusan: String,
  semester: {
    type: String,
    required: true
  },
  tahunAjaran: {
    type: String,
    required: true
  },
  guru: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tanggalDiberikan: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: true
  },
  bobot: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Closed'],
    default: 'Draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tugas', tugasSchema);