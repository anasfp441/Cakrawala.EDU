import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: (token) => api.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateProfile: (profileData, token) => api.put('/auth/profile', profileData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  changePassword: (passwordData, token) => api.put('/auth/change-password', passwordData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  logout: (token) => api.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

// Siswa API
export const siswaAPI = {
  getAll: (params) => api.get('/siswa', { params }),
  getById: (id) => api.get(`/siswa/${id}`),
  create: (data) => api.post('/siswa', data),
  update: (id, data) => api.put(`/siswa/${id}`, data),
  delete: (id) => api.delete(`/siswa/${id}`),
  getStats: () => api.get('/siswa/stats/overview'),
  exportCSV: () => api.get('/siswa/export/csv', { responseType: 'blob' }),
};

// Absen API
export const absenAPI = {
  getAll: (params) => api.get('/absen', { params }),
  getById: (id) => api.get(`/absen/${id}`),
  create: (data) => api.post('/absen', data),
  update: (id, data) => api.put(`/absen/${id}`, data),
  delete: (id) => api.delete(`/absen/${id}`),
  bulkCreate: (data) => api.post('/absen/bulk', data),
  getStats: (params) => api.get('/absen/stats/overview', { params }),
  exportCSV: (params) => api.get('/absen/export/csv', { 
    params, 
    responseType: 'blob' 
  }),
};

// Jadwal API
export const jadwalAPI = {
  getAll: (params) => api.get('/jadwal', { params }),
  getById: (id) => api.get(`/jadwal/${id}`),
  create: (data) => api.post('/jadwal', data),
  update: (id, data) => api.put(`/jadwal/${id}`, data),
  delete: (id) => api.delete(`/jadwal/${id}`),
  toggle: (id) => api.patch(`/jadwal/${id}/toggle`),
  getToday: (params) => api.get('/jadwal/today/current', { params }),
  getWeekly: (params) => api.get('/jadwal/weekly', { params }),
  getStats: (params) => api.get('/jadwal/stats/overview', { params }),
  exportCSV: (params) => api.get('/jadwal/export/csv', { 
    params, 
    responseType: 'blob' 
  }),
};

// Materi API
export const materiAPI = {
  getAll: (params) => api.get('/materi', { params }),
  getById: (id) => api.get(`/materi/${id}`),
  create: (data) => api.post('/materi', data),
  update: (id, data) => api.put(`/materi/${id}`, data),
  delete: (id) => api.delete(`/materi/${id}`),
  publish: (id, isPublished) => api.patch(`/materi/${id}/publish`, { isPublished }),
  download: (id) => api.post(`/materi/${id}/download`),
  getByMapel: (mataPelajaran, params) => api.get(`/materi/mapel/${mataPelajaran}`, { params }),
  getStats: (params) => api.get('/materi/stats/overview', { params }),
  search: (params) => api.get('/materi/search/advanced', { params }),
  exportCSV: (params) => api.get('/materi/export/csv', { 
    params, 
    responseType: 'blob' 
  }),
};

// Tugas API
export const tugasAPI = {
  getAll: (params) => api.get('/tugas', { params }),
  getById: (id) => api.get(`/tugas/${id}`),
  create: (data) => api.post('/tugas', data),
  update: (id, data) => api.put(`/tugas/${id}`, data),
  delete: (id) => api.delete(`/tugas/${id}`),
  updateStatus: (id, status) => api.patch(`/tugas/${id}/status`, { status }),
  toggle: (id) => api.patch(`/tugas/${id}/toggle`),
  getByMapel: (mataPelajaran, params) => api.get(`/tugas/mapel/${mataPelajaran}`, { params }),
  getOverdue: (params) => api.get('/tugas/overdue', { params }),
  getToday: (params) => api.get('/tugas/today', { params }),
  getStats: (params) => api.get('/tugas/stats/overview', { params }),
  exportCSV: (params) => api.get('/tugas/export/csv', { 
    params, 
    responseType: 'blob' 
  }),
};

// Ujian API
export const ujianAPI = {
  getAll: (params) => api.get('/ujian', { params }),
  getById: (id) => api.get(`/ujian/${id}`),
  create: (data) => api.post('/ujian', data),
  update: (id, data) => api.put(`/ujian/${id}`, data),
  delete: (id) => api.delete(`/ujian/${id}`),
  updateStatus: (id, status) => api.patch(`/ujian/${id}/status`, { status }),
  start: (id) => api.post(`/ujian/${id}/start`),
  submit: (id, jawaban) => api.post(`/ujian/${id}/submit`, { jawaban }),
  getResult: (id) => api.get(`/ujian/${id}/result`),
  getParticipants: (id) => api.get(`/ujian/${id}/participants`),
  getStats: (params) => api.get('/ujian/stats/overview', { params }),
  exportResult: (id) => api.get(`/ujian/${id}/export-result`, { 
    responseType: 'blob' 
  }),
};

// Nilai API
export const nilaiAPI = {
  getAll: (params) => api.get('/nilai', { params }),
  getById: (id) => api.get(`/nilai/${id}`),
  create: (data) => api.post('/nilai', data),
  update: (id, data) => api.put(`/nilai/${id}`, data),
  delete: (id) => api.delete(`/nilai/${id}`),
  getBySiswa: (siswaId, params) => api.get(`/nilai/siswa/${siswaId}`, { params }),
  getByMapel: (mataPelajaran, params) => api.get(`/nilai/mapel/${mataPelajaran}`, { params }),
  getRapor: (siswaId, params) => api.get(`/nilai/rapor/${siswaId}`, { params }),
  getStats: (params) => api.get('/nilai/stats/overview', { params }),
  exportCSV: (params) => api.get('/nilai/export/csv', { 
    params, 
    responseType: 'blob' 
  }),
};

// Pengaturan API
export const pengaturanAPI = {
  getAll: () => api.get('/pengaturan'),
  update: (data) => api.put('/pengaturan', data),
  reset: () => api.post('/pengaturan/reset'),
  getByKey: (key) => api.get(`/pengaturan/${key}`),
  updateByKey: (key, value) => api.put(`/pengaturan/${key}`, { value }),
  getPublicInfo: () => api.get('/pengaturan/public/info'),
  getAcademicConfig: () => api.get('/pengaturan/academic/config'),
  getNotificationConfig: () => api.get('/pengaturan/notifications/config'),
  getDisplayConfig: () => api.get('/pengaturan/display/config'),
  exportJSON: () => api.get('/pengaturan/export/json'),
  importJSON: (data) => api.post('/pengaturan/import/json', data),
  backup: () => api.post('/pengaturan/backup'),
  restore: (data) => api.post('/pengaturan/restore', data),
};

export default api;