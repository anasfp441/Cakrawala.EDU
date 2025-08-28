import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  Assignment,
  Schedule,
  Book,
  AssignmentTurnedIn,
  Quiz,
  Grade,
  TrendingUp,
  TrendingDown,
  School,
  Today,
  Event,
} from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const { user, isAdmin, isGuru, isSiswa } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalAbsen: 0,
    totalMateri: 0,
    totalTugas: 0,
    totalUjian: 0,
    totalNilai: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        totalSiswa: 1250,
        totalAbsen: 456,
        totalMateri: 89,
        totalTugas: 67,
        totalUjian: 23,
        totalNilai: 2340,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getRoleText = () => {
    if (isAdmin) return 'Administrator';
    if (isGuru) return 'Guru';
    if (isSiswa) return 'Siswa';
    return 'User';
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [
      {
        label: 'Kehadiran Siswa',
        data: [95, 88, 92, 87, 90, 94],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Nilai Rata-rata',
        data: [78, 82, 79, 85, 81, 83],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Statistik Bulanan',
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          {getGreeting()}, {user?.nama || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Selamat datang di Dashboard {getRoleText()} - Sistem CBT Sekolah
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                <People />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {stats.totalSiswa.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Siswa
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                <Assignment />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {stats.totalAbsen.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Absen Hari Ini
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                <Book />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {stats.totalMateri}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Materi Aktif
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                <AssignmentTurnedIn />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {stats.totalTugas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tugas Aktif
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}>
                <Quiz />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {stats.totalUjian}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ujian Aktif
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                <Grade />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {stats.totalNilai.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nilai Diinput
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Additional Info */}
      <Grid container spacing={3}>
        {/* Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Bar data={chartData} options={chartOptions} />
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Aksi Cepat
            </Typography>
            <List>
              <ListItem button>
                <ListItemIcon>
                  <Today color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Lihat Jadwal Hari Ini" 
                  secondary="Jadwal pelajaran hari ini"
                />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemIcon>
                  <Assignment color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Input Absen" 
                  secondary="Catat kehadiran siswa"
                />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemIcon>
                  <Book color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Upload Materi" 
                  secondary="Upload materi pembelajaran"
                />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemIcon>
                  <Quiz color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Buat Ujian" 
                  secondary="Buat ujian CBT baru"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Aktivitas Terbaru
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                    <People fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Siswa baru ditambahkan"
                  secondary="Ahmad Fadillah - Kelas XI IPA 1"
                />
                <Chip label="2 jam lalu" size="small" variant="outlined" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                    <Book fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Materi baru dipublish"
                  secondary="Matematika - Integral"
                />
                <Chip label="4 jam lalu" size="small" variant="outlined" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                    <AssignmentTurnedIn fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Tugas baru dibuat"
                  secondary="Fisika - Hukum Newton"
                />
                <Chip label="6 jam lalu" size="small" variant="outlined" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Status Sistem
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                    <School fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Database"
                  secondary="Online dan berfungsi normal"
                />
                <Chip label="Online" color="success" size="small" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                    <Event fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Server"
                  secondary="Response time: 45ms"
                />
                <Chip label="Normal" color="success" size="small" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                    <TrendingUp fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Performance"
                  secondary="CPU: 23%, Memory: 45%"
                />
                <Chip label="Optimal" color="success" size="small" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;