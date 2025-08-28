const mongoose = require('mongoose');

const soalSchema = new mongoose.Schema({
  pertanyaan: {
    type: String,
    required: true
  },
  tipe: {
    type: String,
    enum: ['Pilihan Ganda', 'Essay', 'True/False'],
    default: 'Pilihan Ganda'
  },
  pilihan: [String],
  jawabanBenar: [String],
  bobot: {
    type: Number,
    default: 1
  },
  gambar: String,
  penjelasan: String
});

const ujianSchema = new mongoose.Schema({
  judul: {
    type: String,
    required: true
  },
  deskripsi: String,
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
  tanggalUjian: {
    type: Date,
    required: true
  },
  durasi: {
    type: Number, // dalam menit
    required: true
  },
  waktuMulai: Date,
  waktuSelesai: Date,
  soal: [soalSchema],
  totalSoal: {
    type: Number,
    default: 0
  },
  totalNilai: {
    type: Number,
    default: 100
  },
  passingGrade: {
    type: Number,
    default: 70
  },
  isRandom: {
    type: Boolean,
    default: false
  },
  isShuffle: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Active', 'Completed', 'Archived'],
    default: 'Draft'
  },
  peserta: [{
    siswa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Siswa'
    },
    status: {
      type: String,
      enum: ['Belum Mulai', 'Sedang Ujian', 'Selesai', 'Tidak Hadir'],
      default: 'Belum Mulai'
    },
    waktuMulai: Date,
    waktuSelesai: Date,
    jawaban: [{
      soalIndex: Number,
      jawaban: String,
      waktuJawab: Date
    }],
    nilai: Number,
    isPassed: Boolean
  }]
}, {
  timestamps: true
});

// Pre-save hook untuk menghitung total soal
ujianSchema.pre('save', function(next) {
  this.totalSoal = this.soal.length;
  next();
});

module.exports = mongoose.model('Ujian', ujianSchema);