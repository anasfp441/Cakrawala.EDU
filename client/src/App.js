import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { checkAuthStatus } from './store/slices/authSlice';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import SiswaList from './pages/Siswa/SiswaList';
import SiswaForm from './pages/Siswa/SiswaForm';
import AbsenList from './pages/Absen/AbsenList';
import AbsenForm from './pages/Absen/AbsenForm';
import JadwalList from './pages/Jadwal/JadwalList';
import JadwalForm from './pages/Jadwal/JadwalForm';
import MateriList from './pages/Materi/MateriList';
import MateriForm from './pages/Materi/MateriForm';
import TugasList from './pages/Tugas/TugasList';
import TugasForm from './pages/Tugas/TugasForm';
import UjianList from './pages/Ujian/UjianList';
import UjianForm from './pages/Ujian/UjianForm';
import NilaiList from './pages/Nilai/NilaiList';
import NilaiForm from './pages/Nilai/NilaiForm';
import Pengaturan from './pages/Pengaturan/Pengaturan';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          } 
        />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Siswa Management - Admin Only */}
          <Route
            path="siswa"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SiswaList />
              </ProtectedRoute>
            }
          />
          <Route
            path="siswa/new"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SiswaForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="siswa/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SiswaForm />
              </ProtectedRoute>
            }
          />
          
          {/* Absen Management - Admin & Guru */}
          <Route
            path="absen"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <AbsenList />
              </ProtectedRoute>
            }
          />
          <Route
            path="absen/new"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <AbsenForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="absen/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <AbsenForm />
              </ProtectedRoute>
            }
          />
          
          {/* Jadwal Management - Admin & Guru */}
          <Route
            path="jadwal"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <JadwalList />
              </ProtectedRoute>
            }
          />
          <Route
            path="jadwal/new"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <JadwalForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="jadwal/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <JadwalForm />
              </ProtectedRoute>
            }
          />
          
          {/* Materi Management - Admin & Guru */}
          <Route
            path="materi"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <MateriList />
              </ProtectedRoute>
            }
          />
          <Route
            path="materi/new"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <MateriForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="materi/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <MateriForm />
              </ProtectedRoute>
            }
          />
          
          {/* Tugas Management - Admin & Guru */}
          <Route
            path="tugas"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <TugasList />
              </ProtectedRoute>
            }
          />
          <Route
            path="tugas/new"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <TugasForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="tugas/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <TugasForm />
              </ProtectedRoute>
            }
          />
          
          {/* Ujian Management - Admin & Guru */}
          <Route
            path="ujian"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <UjianList />
              </ProtectedRoute>
            }
          />
          <Route
            path="ujian/new"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <UjianForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="ujian/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <UjianForm />
              </ProtectedRoute>
            }
          />
          
          {/* Nilai Management - Admin & Guru */}
          <Route
            path="nilai"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <NilaiList />
              </ProtectedRoute>
            }
          />
          <Route
            path="nilai/new"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <NilaiForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="nilai/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <NilaiForm />
              </ProtectedRoute>
            }
          />
          
          {/* Pengaturan - Admin Only */}
          <Route
            path="pengaturan"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Pengaturan />
              </ProtectedRoute>
            }
          />
          
          {/* Profile - All Authenticated Users */}
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;