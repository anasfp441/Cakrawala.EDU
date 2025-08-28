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
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  School,
  Class,
  Business,
  Person,
} from '@mui/icons-material';
import { fetchSiswa, deleteSiswa, fetchSiswaStats } from '../../store/slices/siswaSlice';
import { RootState, AppDispatch } from '../../store';

const SiswaList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { siswa, pagination, filters, isLoading, error, successMessage } = useSelector(
    (state: RootState) => state.siswa
  );
  const { stats } = useSelector((state: RootState) => state.siswa);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchSiswa({ page: pagination.page, limit: pagination.limit, ...filters }));
    dispatch(fetchSiswaStats());
  }, [dispatch, pagination.page, pagination.limit, filters]);

  const handleSearch = () => {
    dispatch(fetchSiswa({ page: 1, limit: pagination.limit, search: searchTerm, ...filters }));
  };

  const handleFilterChange = (key: string, value: string) => {
    dispatch(fetchSiswa({ page: 1, limit: pagination.limit, [key]: value, ...filters }));
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    dispatch(fetchSiswa({ page: newPage + 1, limit: pagination.limit, ...filters }));
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    dispatch(fetchSiswa({ page: 1, limit: newLimit, ...filters }));
  };

  const handleDelete = (siswa: any) => {
    setSelectedSiswa(siswa);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSiswa) {
      dispatch(deleteSiswa(selectedSiswa._id));
      setDeleteDialogOpen(false);
      setSelectedSiswa(null);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: any } = {
      'Aktif': 'success',
      'Tidak Aktif': 'error',
      'Lulus': 'info',
      'Pindah': 'warning',
    };
    return statusColors[status] || 'default';
  };

  const getJenisKelaminLabel = (jenisKelamin: string) => {
    return jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan';
  };

  if (isLoading && siswa.length === 0) {
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
          Daftar Siswa
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/siswa/add')}
        >
          Tambah Siswa
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
                      {stats.totalSiswa}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Siswa
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
                  <School sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.siswaAktif}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Siswa Aktif
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
                  <Class sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.kelasTerbanyak}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Kelas Terbanyak
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
                  <Business sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.jurusanTerbanyak}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jurusan Terbanyak
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
              label="Cari Siswa"
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
                  <InputLabel>Jurusan</InputLabel>
                  <Select
                    value={filters.jurusan}
                    onChange={(e) => handleFilterChange('jurusan', e.target.value)}
                    label="Jurusan"
                  >
                    <MenuItem value="">Semua</MenuItem>
                    <MenuItem value="IPA">IPA</MenuItem>
                    <MenuItem value="IPS">IPS</MenuItem>
                    <MenuItem value="Bahasa">Bahasa</MenuItem>
                    <MenuItem value="Agama">Agama</MenuItem>
                    <MenuItem value="Teknik">Teknik</MenuItem>
                    <MenuItem value="Ekonomi">Ekonomi</MenuItem>
                    <MenuItem value="Seni">Seni</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">Semua</MenuItem>
                    <MenuItem value="Aktif">Aktif</MenuItem>
                    <MenuItem value="Tidak Aktif">Tidak Aktif</MenuItem>
                    <MenuItem value="Lulus">Lulus</MenuItem>
                    <MenuItem value="Pindah">Pindah</MenuItem>
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
                <TableCell>Foto</TableCell>
                <TableCell>NIS</TableCell>
                <TableCell>Nama</TableCell>
                <TableCell>Jenis Kelamin</TableCell>
                <TableCell>Kelas</TableCell>
                <TableCell>Jurusan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tahun Masuk</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {siswa.map((siswaItem) => (
                <TableRow key={siswaItem._id} hover>
                  <TableCell>
                    <Avatar src={siswaItem.foto} alt={siswaItem.nama}>
                      <Person />
                    </Avatar>
                  </TableCell>
                  <TableCell>{siswaItem.nis}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {siswaItem.nama}
                    </Typography>
                  </TableCell>
                  <TableCell>{getJenisKelaminLabel(siswaItem.jenisKelamin)}</TableCell>
                  <TableCell>
                    <Chip label={siswaItem.kelas} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Chip label={siswaItem.jurusan} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={siswaItem.status}
                      size="small"
                      color={getStatusColor(siswaItem.status)}
                    />
                  </TableCell>
                  <TableCell>{siswaItem.tahunMasuk}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Lihat Detail">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/siswa/${siswaItem._id}`)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/siswa/edit/${siswaItem._id}`)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Hapus">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(siswaItem)}
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
            Apakah Anda yakin ingin menghapus siswa "{selectedSiswa?.nama}"? 
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

export default SiswaList;