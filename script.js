// Data siswa (akan disimpan di localStorage)
let students = [];
let editingIndex = -1;

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    updateSummary();
    updateGradeDistribution();
    
    // Event listener untuk form
    document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
});

// Fungsi untuk menghitung nilai akhir berdasarkan bobot
function calculateFinalGrade(examScore, assignmentScore, attendance) {
    // Bobot: Ujian 60%, Tugas 40%, Bonus Kehadiran 10%
    const examWeight = 0.6;
    const assignmentWeight = 0.4;
    const attendanceBonus = 0.1;
    
    // Nilai akhir = (Ujian × 0.6) + (Tugas × 0.4) + (Kehadiran × 0.1)
    let finalGrade = (examScore * examWeight) + (assignmentScore * assignmentWeight);
    
    // Tambah bonus kehadiran jika kehadiran >= 80%
    if (attendance >= 80) {
        finalGrade += (attendance * attendanceBonus);
    }
    
    // Pastikan nilai tidak melebihi 100
    return Math.min(finalGrade, 100);
}

// Fungsi untuk menentukan grade berdasarkan nilai
function getGrade(finalGrade) {
    if (finalGrade >= 90) return 'A';
    if (finalGrade >= 80) return 'B';
    if (finalGrade >= 70) return 'C';
    if (finalGrade >= 60) return 'D';
    return 'E';
}

// Fungsi untuk menentukan status kelulusan
function getStatus(finalGrade) {
    return finalGrade >= 60 ? 'Lulus' : 'Tidak Lulus';
}

// Fungsi untuk mendapatkan class CSS grade
function getGradeClass(grade) {
    return `grade-${grade.toLowerCase()}`;
}

// Fungsi untuk mendapatkan class CSS status
function getStatusClass(status) {
    return status === 'Lulus' ? 'status-lulus' : 'status-tidak-lulus';
}

// Fungsi untuk menambah siswa baru
function addStudent() {
    editingIndex = -1;
    document.getElementById('modalTitle').textContent = 'Tambah Siswa Baru';
    document.getElementById('studentForm').reset();
    document.getElementById('studentModal').style.display = 'block';
}

// Fungsi untuk edit siswa
function editStudent(index) {
    editingIndex = index;
    const student = students[index];
    
    document.getElementById('modalTitle').textContent = 'Edit Data Siswa';
    document.getElementById('studentName').value = student.name;
    document.getElementById('examScore').value = student.examScore;
    document.getElementById('assignmentScore').value = student.assignmentScore;
    document.getElementById('attendance').value = student.attendance;
    
    document.getElementById('studentModal').style.display = 'block';
}

// Fungsi untuk hapus siswa
function deleteStudent(index) {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
        students.splice(index, 1);
        saveStudents();
        updateSummary();
        updateGradeDistribution();
        renderStudentTable();
    }
}

// Fungsi untuk menutup modal
function closeModal() {
    document.getElementById('studentModal').style.display = 'none';
    editingIndex = -1;
}

// Fungsi untuk handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('studentName').value.trim();
    const examScore = parseFloat(document.getElementById('examScore').value);
    const assignmentScore = parseFloat(document.getElementById('assignmentScore').value);
    const attendance = parseFloat(document.getElementById('attendance').value);
    
    // Validasi input
    if (!name) {
        alert('Nama siswa harus diisi!');
        return;
    }
    
    if (examScore < 0 || examScore > 100 || isNaN(examScore)) {
        alert('Nilai ujian harus antara 0-100!');
        return;
    }
    
    if (assignmentScore < 0 || assignmentScore > 100 || isNaN(assignmentScore)) {
        alert('Nilai tugas harus antara 0-100!');
        return;
    }
    
    if (attendance < 0 || attendance > 100 || isNaN(attendance)) {
        alert('Kehadiran harus antara 0-100%!');
        return;
    }
    
    const finalGrade = calculateFinalGrade(examScore, assignmentScore, attendance);
    const grade = getGrade(finalGrade);
    const status = getStatus(finalGrade);
    
    const studentData = {
        name,
        examScore,
        assignmentScore,
        attendance,
        finalGrade: Math.round(finalGrade * 100) / 100,
        grade,
        status
    };
    
    if (editingIndex === -1) {
        // Tambah siswa baru
        students.push(studentData);
    } else {
        // Edit siswa yang ada
        students[editingIndex] = studentData;
    }
    
    saveStudents();
    updateSummary();
    updateGradeDistribution();
    renderStudentTable();
    closeModal();
}

// Fungsi untuk render tabel siswa
function renderStudentTable() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';
    
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td>${student.examScore}</td>
            <td>${student.assignmentScore}</td>
            <td>${student.attendance}%</td>
            <td><strong>${student.finalGrade}</strong></td>
            <td><span class="grade-badge ${getGradeClass(student.grade)}">${student.grade}</span></td>
            <td><span class="status-badge ${getStatusClass(student.status)}">${student.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editStudent(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteStudent(${index})">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Fungsi untuk update summary cards
function updateSummary() {
    const totalStudents = students.length;
    document.getElementById('totalStudents').textContent = totalStudents;
    
    if (totalStudents === 0) {
        document.getElementById('averageGrade').textContent = '0.00';
        document.getElementById('highestGrade').textContent = '0.00';
        document.getElementById('lowestGrade').textContent = '0.00';
        return;
    }
    
    const grades = students.map(s => s.finalGrade);
    const average = grades.reduce((sum, grade) => sum + grade, 0) / totalStudents;
    const highest = Math.max(...grades);
    const lowest = Math.min(...grades);
    
    document.getElementById('averageGrade').textContent = average.toFixed(2);
    document.getElementById('highestGrade').textContent = highest.toFixed(2);
    document.getElementById('lowestGrade').textContent = lowest.toFixed(2);
}

// Fungsi untuk update distribusi grade
function updateGradeDistribution() {
    const gradeCounts = {
        A: 0, B: 0, C: 0, D: 0, E: 0
    };
    
    students.forEach(student => {
        gradeCounts[student.grade]++;
    });
    
    const totalStudents = students.length;
    
    // Update count dan bar width
    Object.keys(gradeCounts).forEach(grade => {
        const count = gradeCounts[grade];
        const percentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
        
        document.getElementById(`count${grade}`).textContent = count;
        document.getElementById(`grade${grade}`).style.width = `${percentage}%`;
    });
}

// Fungsi untuk save data ke localStorage
function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
}

// Fungsi untuk load data dari localStorage
function loadStudents() {
    const saved = localStorage.getItem('students');
    if (saved) {
        students = JSON.parse(saved);
        renderStudentTable();
    }
}

// Fungsi untuk export ke Excel (CSV)
function exportToExcel() {
    if (students.length === 0) {
        alert('Tidak ada data siswa untuk diexport!');
        return;
    }
    
    // Header CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'No,Nama Siswa,Nilai Ujian,Nilai Tugas,Kehadiran (%),Nilai Akhir,Grade,Status\n';
    
    // Data siswa
    students.forEach((student, index) => {
        const row = [
            index + 1,
            student.name,
            student.examScore,
            student.assignmentScore,
            student.attendance,
            student.finalGrade,
            student.grade,
            student.status
        ].join(',');
        csvContent += row + '\n';
    });
    
    // Download file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_nilai_siswa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event listener untuk menutup modal ketika klik di luar modal
window.onclick = function(event) {
    const modal = document.getElementById('studentModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Tambah beberapa data contoh saat pertama kali load
document.addEventListener('DOMContentLoaded', function() {
    if (students.length === 0) {
        // Data contoh
        const sampleStudents = [
            {
                name: 'Ahmad Fadillah',
                examScore: 85,
                assignmentScore: 90,
                attendance: 95,
                finalGrade: 89.5,
                grade: 'B',
                status: 'Lulus'
            },
            {
                name: 'Siti Nurhaliza',
                examScore: 92,
                assignmentScore: 88,
                attendance: 100,
                finalGrade: 94.8,
                grade: 'A',
                status: 'Lulus'
            },
            {
                name: 'Budi Santoso',
                examScore: 78,
                assignmentScore: 82,
                attendance: 85,
                finalGrade: 79.8,
                grade: 'C',
                status: 'Lulus'
            },
            {
                name: 'Dewi Sartika',
                examScore: 65,
                assignmentScore: 70,
                attendance: 75,
                finalGrade: 67.5,
                grade: 'D',
                status: 'Lulus'
            },
            {
                name: 'Rudi Hermawan',
                examScore: 55,
                assignmentScore: 60,
                attendance: 70,
                finalGrade: 57.0,
                grade: 'E',
                status: 'Tidak Lulus'
            }
        ];
        
        students = sampleStudents;
        saveStudents();
        renderStudentTable();
        updateSummary();
        updateGradeDistribution();
    }
});