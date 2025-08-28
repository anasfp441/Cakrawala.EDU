import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Badge,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  Person,
  CalendarToday,
  School,
  Class,
  Business,
  CheckCircle,
  Cancel,
  Warning,
  Help,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fetchAbsen, deleteAbsen, fetchAbsenStats } from '../../store/slices/absenSlice';
import { RootState, AppDispatch } from '../../store';

const AbsenList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { absen, pagination, filters, isLoading, error, successMessage } = useSelector(
    (state: RootState) => state.absen
  );
  const { stats } = useSelector((state: RootState) => state.absen);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAbsen, setSelectedAbsen] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    dispatch(fetchAbsen({ page: pagination.page, limit: pagination.limit, ...filters }));
    dispatch(fetchAbsenStats());
  }, [dispatch, pagination.page, pagination.limit, filters]);

  const handleSearch = () => {
    dispatch(fetchAbsen({ page: 1, limit: pagination.limit, search: searchTerm, ...filters }));
  };

  const handleFilterChange = (key: string, value: string) => {
    dispatch(fetchAbsen({ page: 1, limit: pagination.limit, [key]: value, ...filters }));
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      dispatch(fetchAbsen({ 
        page: 1, 
        limit: pagination.limit, 
        tanggal: date.toISOString().split('T')[0], 
        ...filters 
      }));
    }
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    dispatch(fetchAbsen({ page: newPage + 1, limit: pagination.limit, ...filters }));
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    dispatch(fetchAbsen({ page: 1, limit: newLimit, ...filters }));
  };

  const handleDelete = (absen: any) => {
    setSelectedAbsen(absen);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAbsen) {
      dispatch(deleteAbsen(selectedAbsen._id));
      setDeleteDialogOpen(false);
      setSelectedAbsen(null);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: any } = {
      'Hadir': 'success',
      'Sakit': 'warning',
      'Izin': 'info',
      'Alpha': 'error',
    };
    return statusColors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const statusIcons: { [key: string]: any } = {
      'Hadir': <CheckCircle />,
      'Sakit': <Warning />,
      'Izin': <Help />,
      'Alpha': <Cancel />,
    };
    return statusIcons[status] || <Help />;
  };

  const formatTime = (time: string) => {
    if (!time) return '-';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading && absen.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Daftar Absensi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/absen/add')}
        >
          Tambah Absensi
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Person sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.totalAbsen}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Absensi
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.hadir}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hadir
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Warning sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.sakit + stats.izin}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sakit + Izin
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Cancel sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.alpha}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Alpha
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Cari Absensi"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch}>
                    <Search />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <DatePicker
              label="Tanggal"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: 'Pilih tanggal',
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filter
            </Button>
          </Grid>

          {showFilters && (
            <>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">Semua</MenuItem>
                    <MenuItem value="Hadir">Hadir</MenuItem>
                    <MenuItem value="Sakit">Sakit</MenuItem>
                    <MenuItem value="Izin">Izin</MenuItem>
                    <MenuItem value="Alpha">Alpha</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Kelas</InputLabel>
                  <Select
                    value={filters.kelas}
                    onChange={(e) => handleFilterChange('kelas', e.target.value)}
                    label="Kelas"
                  >
                    <MenuItem value="">Semua</MenuItem>
                    <MenuItem value="X">X</MenuItem>
                    <MenuItem value="XI">XI</MenuItem>
                    <MenuItem value="XII">XII</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Mata Pelajaran</InputLabel>
                  <Select
                    value={filters.mataPelajaran}
                    onChange={(e) => handleFilterChange('mataPelajaran', e.target.value)}
                    label="Mata Pelajaran"
                  >
                    <MenuItem value="">Semua</MenuItem>
                    <MenuItem value="Matematika">Matematika</MenuItem>
                    <MenuItem value="Bahasa Indonesia">Bahasa Indonesia</MenuItem>
                    <MenuItem value="Bahasa Inggris">Bahasa Inggris</MenuItem>
                    <MenuItem value="IPA">IPA</MenuItem>
                    <MenuItem value="IPS">IPS</MenuItem>
                    <MenuItem value="Pendidikan Agama">Pendidikan Agama</MenuItem>
                    <MenuItem value="PJOK">PJOK</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tanggal</TableCell>
                <TableCell>Foto</TableCell>
                <TableCell>Nama Siswa</TableCell>
                <TableCell>Kelas</TableCell>
                <TableCell>Mata Pelajaran</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Jam Masuk</TableCell>
                <TableCell>Jam Keluar</TableCell>
                <TableCell>Guru</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {absen.map((absenItem) => (
                <TableRow key={absenItem._id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(absenItem.tanggal)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(absenItem.tanggal).toLocaleDateString('id-ID')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Avatar src={absenItem.siswa?.foto} alt={absenItem.siswa?.nama}>
                      <Person />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {absenItem.siswa?.nama}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        NIS: {absenItem.siswa?.nis}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={absenItem.siswa?.kelas} 
                      size="small" 
                      color="primary" 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {absenItem.mataPelajaran}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(absenItem.status)}
                      label={absenItem.status}
                      size="small"
                      color={getStatusColor(absenItem.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatTime(absenItem.jamMasuk)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatTime(absenItem.jamKeluar)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {absenItem.guru?.nama || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Lihat Detail">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/absen/${absenItem._id}`)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/absen/edit/${absenItem._id}`)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Hapus">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(absenItem)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={handleLimitChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
          }
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus absensi untuk siswa "{selectedAbsen?.siswa?.nama}" 
            pada tanggal {selectedAbsen?.tanggal ? formatDate(selectedAbsen.tanggal) : ''}? 
            Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AbsenList;