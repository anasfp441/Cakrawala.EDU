const mongoose = require('mongoose');

const materiSchema = new mongoose.Schema({
  judul: {
    type: String,
    required: true
  },
  deskripsi: String,
  konten: {
    type: String,
    required: true
  },
  file: String,
  linkVideo: String,
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
  tags: [String],
  isPublished: {
    type: Boolean,
    default: false
  },
  tanggalPublish: Date,
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index untuk pencarian
materiSchema.index({ judul: 'text', deskripsi: 'text', tags: 'text' });

module.exports = mongoose.model('Materi', materiSchema);