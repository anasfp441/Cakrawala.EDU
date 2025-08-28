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
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  Schedule,
  School,
  Class,
  Business,
  Person,
  Room,
  CheckCircle,
  Cancel,
  Today,
  ViewWeek,
} from '@mui/icons-material';
import { fetchJadwal, deleteJadwal, fetchJadwalStats, toggleJadwalStatus } from '../../store/slices/jadwalSlice';
import { RootState, AppDispatch } from '../../store';

const JadwalList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { jadwal, pagination, filters, isLoading, error, successMessage } = useSelector(
    (state: RootState) => state.jadwal
  );
  const { stats } = useSelector((state: RootState) => state.jadwal);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchJadwal({ page: pagination.page, limit: pagination.limit, ...filters }));
    dispatch(fetchJadwalStats());
  }, [dispatch, pagination.page, pagination.limit, filters]);

  const handleSearch = () => {
    dispatch(fetchJadwal({ page: 1, limit: pagination.limit, search: searchTerm, ...filters }));
  };

  const handleFilterChange = (key: string, value: string) => {
    dispatch(fetchJadwal({ page: 1, limit: pagination.limit, [key]: value, ...filters }));
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    dispatch(fetchJadwal({ page: newPage + 1, limit: pagination.limit, ...filters }));
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    dispatch(fetchJadwal({ page: 1, limit: newLimit, ...filters }));
  };

  const handleDelete = (jadwal: any) => {
    setSelectedJadwal(jadwal);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedJadwal) {
      dispatch(deleteJadwal(selectedJadwal._id));
      setDeleteDialogOpen(false);
      setSelectedJadwal(null);
    }
  };

  const handleToggleStatus = (jadwal: any) => {
    dispatch(toggleJadwalStatus(jadwal._id));
  };

  const getHariColor = (hari: string) => {
    const hariColors: { [key: string]: any } = {
      'Senin': 'primary',
      'Selasa': 'secondary',
      'Rabu': 'success',
      'Kamis': 'warning',
      'Jumat': 'info',
      'Sabtu': 'error',
      'Minggu': 'default',
    };
    return hariColors[hari] || 'default';
  };

  const formatTime = (time: string) => {
    if (!time) return '-';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle /> : <Cancel />;
  };

  if (isLoading && jadwal.length === 0) {
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
          Daftar Jadwal
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/jadwal/add')}
        >
          Tambah Jadwal
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Schedule sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.totalJadwal}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Jadwal
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
                      {stats.jadwalAktif}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jadwal Aktif
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
                  <School sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.mataPelajaranTerbanyak}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mata Pelajaran Terbanyak
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
                  <Person sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.guruTerbanyak}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Guru Terbanyak
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Cari Jadwal"
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
                  <InputLabel>Hari</InputLabel>
                  <Select
                    value={filters.hari}
                    onChange={(e) => handleFilterChange('hari', e.target.value)}
                    label="Hari"
                  >
                    <MenuItem value="">Semua</MenuItem>
                    <MenuItem value="Senin">Senin</MenuItem>
                    <MenuItem value="Selasa">Selasa</MenuItem>
                    <MenuItem value="Rabu">Rabu</MenuItem>
                    <MenuItem value="Kamis">Kamis</MenuItem>
                    <MenuItem value="Jumat">Jumat</MenuItem>
                    <MenuItem value="Sabtu">Sabtu</MenuItem>
                    <MenuItem value="Minggu">Minggu</MenuItem>
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
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.isActive}
                    onChange={(e) => handleFilterChange('isActive', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">Semua</MenuItem>
                    <MenuItem value="true">Aktif</MenuItem>
                    <MenuItem value="false">Tidak Aktif</MenuItem>
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
                <TableCell>Hari</TableCell>
                <TableCell>Jam</TableCell>
                <TableCell>Mata Pelajaran</TableCell>
                <TableCell>Kelas</TableCell>
                <TableCell>Jurusan</TableCell>
                <TableCell>Guru</TableCell>
                <TableCell>Ruangan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jadwal.map((jadwalItem) => (
                <TableRow key={jadwalItem._id} hover>
                  <TableCell>
                    <Chip
                      label={jadwalItem.hari}
                      size="small"
                      color={getHariColor(jadwalItem.hari)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatTime(jadwalItem.jamMulai)} - {formatTime(jadwalItem.jamSelesai)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {jadwalItem.durasi} menit
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {jadwalItem.mataPelajaran}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={jadwalItem.kelas} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Chip label={jadwalItem.jurusan} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {jadwalItem.guru?.nama || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Room sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2">
                        {jadwalItem.ruangan || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={jadwalItem.isActive}
                          onChange={() => handleToggleStatus(jadwalItem)}
                          color="success"
                          size="small"
                        />
                      }
                      label={
                        <Chip
                          icon={getStatusIcon(jadwalItem.isActive)}
                          label={jadwalItem.isActive ? 'Aktif' : 'Tidak Aktif'}
                          size="small"
                          color={getStatusColor(jadwalItem.isActive)}
                        />
                      }
                      labelPlacement="end"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {jadwalItem.semester}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Lihat Detail">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/jadwal/${jadwalItem._id}`)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/jadwal/edit/${jadwalItem._id}`)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Hapus">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(jadwalItem)}
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
            Apakah Anda yakin ingin menghapus jadwal "{selectedJadwal?.mataPelajaran}" 
            untuk kelas {selectedJadwal?.kelas} {selectedJadwal?.jurusan} 
            pada hari {selectedJadwal?.hari}? Tindakan ini tidak dapat dibatalkan.
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

export default JadwalList;