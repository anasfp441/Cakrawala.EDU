const mongoose = require('mongoose');

const siswaSchema = new mongoose.Schema({
  nis: {
    type: String,
    required: true,
    unique: true
  },
  nama: {
    type: String,
    required: true
  },
  tempatLahir: String,
  tanggalLahir: Date,
  jenisKelamin: {
    type: String,
    enum: ['Laki-laki', 'Perempuan']
  },
  alamat: String,
  noTelp: String,
  email: String,
  kelas: {
    type: String,
    required: true
  },
  jurusan: String,
  tahunMasuk: Number,
  status: {
    type: String,
    enum: ['Aktif', 'Tidak Aktif', 'Lulus', 'Drop Out'],
    default: 'Aktif'
  },
  foto: String,
  namaWali: String,
  noTelpWali: String,
  alamatWali: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Siswa', siswaSchema);