const mongoose = require('mongoose');

const nilaiSchema = new mongoose.Schema({
  siswa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Siswa',
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
    ref: 'User'
  },
  nilaiTugas: {
    type: Number,
    min: 0,
    max: 100
  },
  nilaiUjian: {
    type: Number,
    min: 0,
    max: 100
  },
  nilaiPraktikum: {
    type: Number,
    min: 0,
    max: 100
  },
  nilaiAkhir: {
    type: Number,
    min: 0,
    max: 100
  },
  bobotTugas: {
    type: Number,
    default: 30
  },
  bobotUjian: {
    type: Number,
    default: 60
  },
  bobotPraktikum: {
    type: Number,
    default: 10
  },
  grade: {
    type: String,
    enum: ['A', 'B+', 'B', 'C+', 'C', 'D', 'E']
  },
  keterangan: String,
  tanggalUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save hook untuk menghitung nilai akhir
nilaiSchema.pre('save', function(next) {
  if (this.nilaiTugas !== undefined && this.nilaiUjian !== undefined) {
    let totalBobot = this.bobotTugas + this.bobotUjian;
    let nilaiAkhir = 0;
    
    if (this.nilaiPraktikum !== undefined) {
      totalBobot += this.bobotPraktikum;
      nilaiAkhir = (this.nilaiTugas * this.bobotTugas + 
                    this.nilaiUjian * this.bobotUjian + 
                    this.nilaiPraktikum * this.bobotPraktikum) / totalBobot;
    } else {
      nilaiAkhir = (this.nilaiTugas * this.bobotTugas + 
                    this.nilaiUjian * this.bobotUjian) / totalBobot;
    }
    
    this.nilaiAkhir = Math.round(nilaiAkhir);
    
    // Menentukan grade
    if (this.nilaiAkhir >= 85) this.grade = 'A';
    else if (this.nilaiAkhir >= 80) this.grade = 'B+';
    else if (this.nilaiAkhir >= 75) this.grade = 'B';
    else if (this.nilaiAkhir >= 70) this.grade = 'C+';
    else if (this.nilaiAkhir >= 65) this.grade = 'C';
    else if (this.nilaiAkhir >= 60) this.grade = 'D';
    else this.grade = 'E';
  }
  
  next();
});

// Compound index untuk mencegah duplikasi nilai
nilaiSchema.index({ 
  siswa: 1, 
  mataPelajaran: 1, 
  kelas: 1, 
  semester: 1, 
  tahunAjaran: 1 
}, { unique: true });

module.exports = mongoose.model('Nilai', nilaiSchema);