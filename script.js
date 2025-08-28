// CBT School Learning Application - Main JavaScript

// Global variables
let currentPage = 'home';
let students = [];
let attendance = [];
let schedules = [];
let materials = [];
let assignments = [];
let exams = [];
let grades = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSampleData();
    setupEventListeners();
    renderCurrentPage();
});

// Initialize application
function initializeApp() {
    console.log('Initializing CBT School Application...');
    
    // Set current date for attendance
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendance-date').value = today;
    
    // Initialize Chart.js for grades
    initializeGradesChart();
}

// Setup event listeners
function setupEventListeners() {
    // Menu navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            navigateToPage(page);
        });
    });
    
    // Search functionality
    const studentSearch = document.getElementById('student-search');
    if (studentSearch) {
        studentSearch.addEventListener('input', function() {
            filterStudents(this.value);
        });
    }
    
    // Class filters
    const classFilter = document.getElementById('class-filter');
    if (classFilter) {
        classFilter.addEventListener('change', function() {
            filterSchedules(this.value);
        });
    }
    
    // Grade filters
    const gradeClassFilter = document.getElementById('grade-class-filter');
    const gradeSubjectFilter = document.getElementById('grade-subject-filter');
    
    if (gradeClassFilter) {
        gradeClassFilter.addEventListener('change', function() {
            filterGrades();
        });
    }
    
    if (gradeSubjectFilter) {
        gradeSubjectFilter.addEventListener('change', function() {
            filterGrades();
        });
    }
}

// Navigation function
function navigateToPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    
    // Show selected page
    document.getElementById(page).classList.add('active');
    
    // Add active class to selected menu item
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    // Update page title
    updatePageTitle(page);
    
    // Render page content
    renderPageContent(page);
    
    currentPage = page;
}

// Update page title
function updatePageTitle(page) {
    const titles = {
        'home': 'Halaman Home Admin',
        'students': 'Daftar Siswa',
        'attendance': 'Cek Absen Siswa',
        'schedule': 'Jadwal',
        'materials': 'Materi Pembelajaran',
        'assignments': 'Tugas Harian',
        'exams': 'Ujian',
        'grades': 'Nilai',
        'settings': 'Pengaturan'
    };
    
    document.getElementById('page-title').textContent = titles[page] || 'Dashboard';
}

// Render page content
function renderPageContent(page) {
    switch(page) {
        case 'home':
            renderDashboard();
            break;
        case 'students':
            renderStudentsTable();
            break;
        case 'attendance':
            renderAttendanceTable();
            break;
        case 'schedule':
            renderScheduleGrid();
            break;
        case 'materials':
            renderMaterialsGrid();
            break;
        case 'assignments':
            renderAssignmentsList();
            break;
        case 'exams':
            renderExamsGrid();
            break;
        case 'grades':
            renderGradesTable();
            break;
        case 'settings':
            // Settings page is static
            break;
    }
}

// Load sample data
function loadSampleData() {
    // Sample students data
    students = [
        { nis: '2024001', nama: 'Ahmad Fadillah', kelas: '10A', email: 'ahmad@email.com', status: 'Aktif' },
        { nis: '2024002', nama: 'Siti Nurhaliza', kelas: '10A', email: 'siti@email.com', status: 'Aktif' },
        { nis: '2024003', nama: 'Budi Santoso', kelas: '10B', email: 'budi@email.com', status: 'Aktif' },
        { nis: '2024004', nama: 'Dewi Sartika', kelas: '10B', email: 'dewi@email.com', status: 'Aktif' },
        { nis: '2024005', nama: 'Rudi Hermawan', kelas: '11A', email: 'rudi@email.com', status: 'Aktif' }
    ];
    
    // Sample attendance data
    attendance = [
        { nis: '2024001', nama: 'Ahmad Fadillah', kelas: '10A', status: 'Hadir', waktu: '07:30' },
        { nis: '2024002', nama: 'Siti Nurhaliza', kelas: '10A', status: 'Hadir', waktu: '07:25' },
        { nis: '2024003', nama: 'Budi Santoso', kelas: '10B', status: 'Sakit', waktu: '-' },
        { nis: '2024004', nama: 'Dewi Sartika', kelas: '10B', status: 'Hadir', waktu: '07:35' },
        { nis: '2024005', nama: 'Rudi Hermawan', kelas: '11A', status: 'Izin', waktu: '-' }
    ];
    
    // Sample schedules data
    schedules = [
        { kelas: '10A', hari: 'Senin', jam: '07:00-08:30', mataPelajaran: 'Matematika', guru: 'Pak Ahmad' },
        { kelas: '10A', hari: 'Senin', jam: '08:45-10:15', mataPelajaran: 'Bahasa Indonesia', guru: 'Bu Siti' },
        { kelas: '10B', hari: 'Senin', jam: '07:00-08:30', mataPelajaran: 'Fisika', guru: 'Pak Budi' },
        { kelas: '11A', hari: 'Senin', jam: '07:00-08:30', mataPelajaran: 'Kimia', guru: 'Bu Dewi' }
    ];
    
    // Sample materials data
    materials = [
        { id: 1, judul: 'Matematika Dasar', mataPelajaran: 'Matematika', kelas: '10A', deskripsi: 'Materi dasar matematika untuk kelas 10', file: 'matematika-dasar.pdf' },
        { id: 2, judul: 'Sejarah Indonesia', mataPelajaran: 'Sejarah', kelas: '10A', deskripsi: 'Materi sejarah Indonesia modern', file: 'sejarah-indonesia.pdf' },
        { id: 3, judul: 'Fisika Mekanika', mataPelajaran: 'Fisika', kelas: '10B', deskripsi: 'Materi fisika tentang mekanika', file: 'fisika-mekanika.pdf' }
    ];
    
    // Sample assignments data
    assignments = [
        { id: 1, judul: 'Tugas Matematika', mataPelajaran: 'Matematika', kelas: '10A', deadline: '2024-01-15', deskripsi: 'Kerjakan soal halaman 45-50' },
        { id: 2, judul: 'Essay Bahasa Indonesia', mataPelajaran: 'Bahasa Indonesia', kelas: '10A', deadline: '2024-01-20', deskripsi: 'Tulis essay tentang pendidikan' },
        { id: 3, judul: 'Laporan Fisika', mataPelajaran: 'Fisika', kelas: '10B', deadline: '2024-01-18', deskripsi: 'Buat laporan praktikum' }
    ];
    
    // Sample exams data
    exams = [
        { id: 1, nama: 'Ujian Tengah Semester Matematika', mataPelajaran: 'Matematika', kelas: '10A', tanggal: '2024-01-25', durasi: 90, status: 'Aktif' },
        { id: 2, nama: 'Quiz Bahasa Indonesia', mataPelajaran: 'Bahasa Indonesia', kelas: '10A', tanggal: '2024-01-22', durasi: 45, status: 'Aktif' },
        { id: 3, nama: 'Ujian Fisika', mataPelajaran: 'Fisika', kelas: '10B', tanggal: '2024-01-28', durasi: 90, status: 'Draft' }
    ];
    
    // Sample grades data
    grades = [
        { nis: '2024001', nama: 'Ahmad Fadillah', kelas: '10A', mataPelajaran: 'Matematika', nilai: 85, grade: 'A' },
        { nis: '2024001', nama: 'Ahmad Fadillah', kelas: '10A', mataPelajaran: 'Bahasa Indonesia', nilai: 90, grade: 'A' },
        { nis: '2024002', nama: 'Siti Nurhaliza', kelas: '10A', mataPelajaran: 'Matematika', nilai: 88, grade: 'A' },
        { nis: '2024002', nama: 'Siti Nurhaliza', kelas: '10A', mataPelajaran: 'Bahasa Indonesia', nilai: 92, grade: 'A' },
        { nis: '2024003', nama: 'Budi Santoso', kelas: '10B', mataPelajaran: 'Fisika', nilai: 78, grade: 'B' }
    ];
}

// Render dashboard
function renderDashboard() {
    // Dashboard is mostly static, just update numbers if needed
    console.log('Dashboard rendered');
}

// Render students table
function renderStudentsTable() {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.nis}</td>
            <td>${student.nama}</td>
            <td>${student.kelas}</td>
            <td>${student.email}</td>
            <td><span class="status-badge ${student.status.toLowerCase()}">${student.status}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editStudent('${student.nis}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="deleteStudent('${student.nis}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Render attendance table
function renderAttendanceTable() {
    const tbody = document.getElementById('attendance-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = attendance.map(record => `
        <tr>
            <td>${record.nis}</td>
            <td>${record.nama}</td>
            <td>${record.kelas}</td>
            <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
            <td>${record.waktu}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editAttendance('${record.nis}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Render schedule grid
function renderScheduleGrid() {
    const grid = document.getElementById('schedule-grid');
    if (!grid) return;
    
    grid.innerHTML = schedules.map(schedule => `
        <div class="schedule-card">
            <div class="schedule-header">
                <h3>${schedule.mataPelajaran}</h3>
                <span class="schedule-time">${schedule.jam}</span>
            </div>
            <div class="schedule-details">
                <p><strong>Kelas:</strong> ${schedule.kelas}</p>
                <p><strong>Hari:</strong> ${schedule.hari}</p>
                <p><strong>Guru:</strong> ${schedule.guru}</p>
            </div>
            <div class="schedule-actions">
                <button class="btn btn-secondary btn-sm" onclick="editSchedule(${schedules.indexOf(schedule)})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="deleteSchedule(${schedules.indexOf(schedule)})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Render materials grid
function renderMaterialsGrid() {
    const grid = document.getElementById('materials-grid');
    if (!grid) return;
    
    grid.innerHTML = materials.map(material => `
        <div class="material-card">
            <div class="material-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <div class="material-content">
                <h3>${material.judul}</h3>
                <p><strong>Mata Pelajaran:</strong> ${material.mataPelajaran}</p>
                <p><strong>Kelas:</strong> ${material.kelas}</p>
                <p>${material.deskripsi}</p>
                <div class="material-actions">
                    <button class="btn btn-primary btn-sm" onclick="downloadMaterial(${material.id})">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editMaterial(${material.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render assignments list
function renderAssignmentsList() {
    const list = document.getElementById('assignments-list');
    if (!list) return;
    
    list.innerHTML = assignments.map(assignment => `
        <div class="assignment-card">
            <div class="assignment-header">
                <h3>${assignment.judul}</h3>
                <span class="assignment-deadline">Deadline: ${assignment.deadline}</span>
            </div>
            <div class="assignment-details">
                <p><strong>Mata Pelajaran:</strong> ${assignment.mataPelajaran}</p>
                <p><strong>Kelas:</strong> ${assignment.kelas}</p>
                <p>${assignment.deskripsi}</p>
            </div>
            <div class="assignment-actions">
                <button class="btn btn-primary btn-sm" onclick="viewAssignment(${assignment.id})">
                    <i class="fas fa-eye"></i> Lihat
                </button>
                <button class="btn btn-secondary btn-sm" onclick="editAssignment(${assignment.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Render exams grid
function renderExamsGrid() {
    const grid = document.getElementById('exams-grid');
    if (!grid) return;
    
    grid.innerHTML = exams.map(exam => `
        <div class="exam-card">
            <div class="exam-header">
                <h3>${exam.nama}</h3>
                <span class="exam-status ${exam.status.toLowerCase()}">${exam.status}</span>
            </div>
            <div class="exam-details">
                <p><strong>Mata Pelajaran:</strong> ${exam.mataPelajaran}</p>
                <p><strong>Kelas:</strong> ${exam.kelas}</p>
                <p><strong>Tanggal:</strong> ${exam.tanggal}</p>
                <p><strong>Durasi:</strong> ${exam.durasi} menit</p>
            </div>
            <div class="exam-actions">
                <button class="btn btn-primary btn-sm" onclick="viewExam(${exam.id})">
                    <i class="fas fa-eye"></i> Lihat
                </button>
                <button class="btn btn-secondary btn-sm" onclick="editExam(${exam.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Render grades table
function renderGradesTable() {
    const tbody = document.getElementById('grades-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = grades.map(grade => `
        <tr>
            <td>${grade.nis}</td>
            <td>${grade.nama}</td>
            <td>${grade.kelas}</td>
            <td>${grade.mataPelajaran}</td>
            <td>${grade.nilai}</td>
            <td><span class="grade-badge ${getGradeClass(grade.grade)}">${grade.grade}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editGrade('${grade.nis}', '${grade.mataPelajaran}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Initialize grades chart
function initializeGradesChart() {
    const ctx = document.getElementById('grades-chart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Rata-rata Nilai Kelas 10A',
                data: [8.2, 8.5, 8.3, 8.7, 8.9, 8.5],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }, {
                label: 'Rata-rata Nilai Kelas 10B',
                data: [7.8, 8.1, 7.9, 8.3, 8.5, 8.2],
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Perkembangan Nilai Siswa'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}

// Filter functions
function filterStudents(query) {
    const filtered = students.filter(student => 
        student.nama.toLowerCase().includes(query.toLowerCase()) ||
        student.nis.includes(query) ||
        student.kelas.toLowerCase().includes(query.toLowerCase())
    );
    
    renderFilteredStudents(filtered);
}

function filterSchedules(selectedClass) {
    const filtered = selectedClass ? schedules.filter(s => s.kelas === selectedClass) : schedules;
    renderFilteredSchedules(filtered);
}

function filterGrades() {
    const selectedClass = document.getElementById('grade-class-filter').value;
    const selectedSubject = document.getElementById('grade-subject-filter').value;
    
    let filtered = grades;
    
    if (selectedClass) {
        filtered = filtered.filter(g => g.kelas === selectedClass);
    }
    
    if (selectedSubject) {
        filtered = filtered.filter(g => g.mataPelajaran.toLowerCase().includes(selectedSubject.toLowerCase()));
    }
    
    renderFilteredGrades(filtered);
}

// Render filtered data
function renderFilteredStudents(filteredStudents) {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = filteredStudents.map(student => `
        <tr>
            <td>${student.nis}</td>
            <td>${student.nama}</td>
            <td>${student.kelas}</td>
            <td>${student.email}</td>
            <td><span class="status-badge ${student.status.toLowerCase()}">${student.status}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editStudent('${student.nis}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="deleteStudent('${student.nis}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderFilteredSchedules(filteredSchedules) {
    const grid = document.getElementById('schedule-grid');
    if (!grid) return;
    
    grid.innerHTML = filteredSchedules.map(schedule => `
        <div class="schedule-card">
            <div class="schedule-header">
                <h3>${schedule.mataPelajaran}</h3>
                <span class="schedule-time">${schedule.jam}</span>
            </div>
            <div class="schedule-details">
                <p><strong>Kelas:</strong> ${schedule.kelas}</p>
                <p><strong>Hari:</strong> ${schedule.hari}</p>
                <p><strong>Guru:</strong> ${schedule.guru}</p>
            </div>
            <div class="schedule-actions">
                <button class="btn btn-secondary btn-sm" onclick="editSchedule(${schedules.indexOf(schedule)})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="deleteSchedule(${schedules.indexOf(schedule)})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderFilteredGrades(filteredGrades) {
    const tbody = document.getElementById('grades-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = filteredGrades.map(grade => `
        <tr>
            <td>${grade.nis}</td>
            <td>${grade.nama}</td>
            <td>${grade.kelas}</td>
            <td>${grade.mataPelajaran}</td>
            <td>${grade.nilai}</td>
            <td><span class="grade-badge ${getGradeClass(grade.grade)}">${grade.grade}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editGrade('${grade.nis}', '${grade.mataPelajaran}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Utility functions
function getGradeClass(grade) {
    if (grade === 'A') return 'grade-a';
    if (grade === 'B') return 'grade-b';
    if (grade === 'C') return 'grade-c';
    if (grade === 'D') return 'grade-d';
    return 'grade-f';
}

// Modal functions
function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

// CRUD operations for students
function showAddStudentModal() {
    const content = `
        <form id="add-student-form">
            <div class="form-group">
                <label>NIS</label>
                <input type="text" name="nis" required>
            </div>
            <div class="form-group">
                <label>Nama</label>
                <input type="text" name="nama" required>
            </div>
            <div class="form-group">
                <label>Kelas</label>
                <select name="kelas" required>
                    <option value="">Pilih Kelas</option>
                    <option value="10A">Kelas 10A</option>
                    <option value="10B">Kelas 10B</option>
                    <option value="11A">Kelas 11A</option>
                    <option value="11B">Kelas 11B</option>
                    <option value="12A">Kelas 12A</option>
                    <option value="12B">Kelas 12B</option>
                </select>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
        </form>
    `;
    
    showModal('Tambah Siswa Baru', content);
    
    // Add form submit handler
    document.getElementById('add-student-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addStudent(new FormData(this));
    });
}

function addStudent(formData) {
    const student = {
        nis: formData.get('nis'),
        nama: formData.get('nama'),
        kelas: formData.get('kelas'),
        email: formData.get('email'),
        status: 'Aktif'
    };
    
    students.push(student);
    renderStudentsTable();
    closeModal();
    
    // Show success message
    showNotification('Siswa berhasil ditambahkan!', 'success');
}

function editStudent(nis) {
    const student = students.find(s => s.nis === nis);
    if (!student) return;
    
    const content = `
        <form id="edit-student-form">
            <div class="form-group">
                <label>NIS</label>
                <input type="text" name="nis" value="${student.nis}" readonly>
            </div>
            <div class="form-group">
                <label>Nama</label>
                <input type="text" name="nama" value="${student.nama}" required>
            </div>
            <div class="form-group">
                <label>Kelas</label>
                <select name="kelas" required>
                    <option value="10A" ${student.kelas === '10A' ? 'selected' : ''}>Kelas 10A</option>
                    <option value="10B" ${student.kelas === '10B' ? 'selected' : ''}>Kelas 10B</option>
                    <option value="11A" ${student.kelas === '11A' ? 'selected' : ''}>Kelas 11A</option>
                    <option value="11B" ${student.kelas === '11B' ? 'selected' : ''}>Kelas 11B</option>
                    <option value="12A" ${student.kelas === '12A' ? 'selected' : ''}>Kelas 12A</option>
                    <option value="12B" ${student.kelas === '12B' ? 'selected' : ''}>Kelas 12B</option>
                </select>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" value="${student.email}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary">Update</button>
            </div>
        </form>
    `;
    
    showModal('Edit Data Siswa', content);
    
    // Add form submit handler
    document.getElementById('edit-student-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateStudent(nis, new FormData(this));
    });
}

function updateStudent(nis, formData) {
    const index = students.findIndex(s => s.nis === nis);
    if (index === -1) return;
    
    students[index] = {
        ...students[index],
        nama: formData.get('nama'),
        kelas: formData.get('kelas'),
        email: formData.get('email')
    };
    
    renderStudentsTable();
    closeModal();
    showNotification('Data siswa berhasil diupdate!', 'success');
}

function deleteStudent(nis) {
    if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
        students = students.filter(s => s.nis !== nis);
        renderStudentsTable();
        showNotification('Siswa berhasil dihapus!', 'success');
    }
}

// Similar CRUD functions for other entities...
function showAddScheduleModal() {
    showModal('Tambah Jadwal', '<p>Form tambah jadwal akan ditampilkan di sini</p>');
}

function showAddMaterialModal() {
    showModal('Tambah Materi', '<p>Form tambah materi akan ditampilkan di sini</p>');
}

function showAddAssignmentModal() {
    showModal('Tambah Tugas', '<p>Form tambah tugas akan ditampilkan di sini</p>');
}

function showAddExamModal() {
    showModal('Buat Ujian', '<p>Form buat ujian akan ditampilkan di sini</p>');
}

// Placeholder functions for other operations
function editAttendance(nis) { showNotification('Fitur edit absensi akan segera tersedia', 'info'); }
function editSchedule(index) { showNotification('Fitur edit jadwal akan segera tersedia', 'info'); }
function editMaterial(id) { showNotification('Fitur edit materi akan segera tersedia', 'info'); }
function editAssignment(id) { showNotification('Fitur edit tugas akan segera tersedia', 'info'); }
function editExam(id) { showNotification('Fitur edit ujian akan segera tersedia', 'info'); }
function editGrade(nis, mataPelajaran) { showNotification('Fitur edit nilai akan segera tersedia', 'info'); }
function deleteSchedule(index) { showNotification('Fitur hapus jadwal akan segera tersedia', 'info'); }
function downloadMaterial(id) { showNotification('Fitur download materi akan segera tersedia', 'info'); }
function viewAssignment(id) { showNotification('Fitur lihat tugas akan segera tersedia', 'info'); }
function viewExam(id) { showNotification('Fitur lihat ujian akan segera tersedia', 'info'); }

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    }
    
    .notification-success {
        border-left: 4px solid #10b981;
    }
    
    .notification-error {
        border-left: 4px solid #ef4444;
    }
    
    .notification-warning {
        border-left: 4px solid #f59e0b;
    }
    
    .notification-info {
        border-left: 4px solid #3b82f6;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    .notification-close:hover {
        background-color: #f1f5f9;
        color: #1e293b;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Add additional CSS for components
const additionalStyles = `
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .status-badge.aktif {
        background-color: #d1fae5;
        color: #065f46;
    }
    
    .status-badge.hadir {
        background-color: #d1fae5;
        color: #065f46;
    }
    
    .status-badge.sakit {
        background-color: #fef3c7;
        color: #92400e;
    }
    
    .status-badge.izin {
        background-color: #dbeafe;
        color: #1e40af;
    }
    
    .status-badge.alpha {
        background-color: #fee2e2;
        color: #991b1b;
    }
    
    .grade-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .grade-badge.grade-a {
        background-color: #d1fae5;
        color: #065f46;
    }
    
    .grade-badge.grade-b {
        background-color: #dbeafe;
        color: #1e40af;
    }
    
    .grade-badge.grade-c {
        background-color: #fef3c7;
        color: #92400e;
    }
    
    .grade-badge.grade-d {
        background-color: #fef3c7;
        color: #92400e;
    }
    
    .grade-badge.grade-f {
        background-color: #fee2e2;
        color: #991b1b;
    }
    
    .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
    }
    
    .schedule-card,
    .material-card,
    .assignment-card,
    .exam-card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
    }
    
    .schedule-card:hover,
    .material-card:hover,
    .assignment-card:hover,
    .exam-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    .schedule-header,
    .material-content,
    .assignment-header,
    .exam-header {
        margin-bottom: 1rem;
    }
    
    .schedule-time,
    .assignment-deadline,
    .exam-status {
        font-size: 0.875rem;
        color: #64748b;
        font-weight: 500;
    }
    
    .exam-status.aktif {
        color: #10b981;
    }
    
    .exam-status.draft {
        color: #f59e0b;
    }
    
    .material-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .schedule-actions,
    .material-actions,
    .assignment-actions,
    .exam-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }
`;

// Inject additional styles
const additionalStyleSheet = document.createElement('style');
additionalStyleSheet.textContent = additionalStyles;
document.head.appendChild(additionalStyleSheet);

console.log('CBT School Application JavaScript loaded successfully!');