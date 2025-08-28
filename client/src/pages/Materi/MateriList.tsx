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
  Avatar,
  Badge,
  CardActions,
  LinearProgress,
  Fab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  Download,
  CloudDownload,
  School,
  Book,
  Person,
  CalendarToday,
  CheckCircle,
  Cancel,
  Publish,
  Unpublish,
  FileCopy,
  Star,
  StarBorder,
  AccessTime,
  Category,
  Language,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { fetchMateri, deleteMateri, fetchMateriStats, toggleMateriPublish } from '../../store/slices/materiSlice';
import { RootState, AppDispatch } from '../../store';

const MateriList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { materi, pagination, filters, isLoading, error, successMessage } = useSelector(
    (state: RootState) => state.materi
  );
  const { stats } = useSelector((state: RootState) => state.materi);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMateri, setSelectedMateri] = useState<any>(null);
  const [expandedMateri, setExpandedMateri] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMateri({ page: pagination.page, limit: pagination.limit, ...filters }));
    dispatch(fetchMateriStats());
  }, [dispatch, pagination.page, pagination.limit, filters]);

  const handleSearch = () => {
    dispatch(fetchMateri({ page: 1, limit: pagination.limit, search: searchTerm, ...filters }));
  };

  const handleFilterChange = (key: string, value: string) => {
    dispatch(fetchMateri({ page: 1, limit: pagination.limit, [key]: value, ...filters }));
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    dispatch(fetchMateri({ page: newPage + 1, limit: pagination.limit, ...filters }));
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    dispatch(fetchMateri({ page: 1, limit: newLimit, ...filters }));
  };

  const handleDelete = (materi: any) => {
    setSelectedMateri(materi);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMateri) {
      dispatch(deleteMateri(selectedMateri._id));
      setDeleteDialogOpen(false);
      setSelectedMateri(null);
    }
  };

  const handleTogglePublish = (materi: any) => {
    dispatch(toggleMateriPublish(materi._id));
  };

  const handleDownload = (materi: any) => {
    // Handle download logic
    console.log('Downloading:', materi.judul);
  };

  const toggleExpanded = (materiId: string) => {
    setExpandedMateri(expandedMateri === materiId ? null : materiId);
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished ? 'success' : 'warning';
  };

  const getStatusIcon = (isPublished: boolean) => {
    return isPublished ? <CheckCircle /> : <Cancel />;
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <FileCopy sx={{ color: 'error.main' }} />;
      case 'doc':
      case 'docx':
        return <FileCopy sx={{ color: 'primary.main' }} />;
      case 'ppt':
      case 'pptx':
        return <FileCopy sx={{ color: 'warning.main' }} />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileCopy sx={{ color: 'secondary.main' }} />;
      default:
        return <FileCopy sx={{ color: 'grey.500' }} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading && materi.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="400px">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Memuat data materi...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
            Daftar Materi Pembelajaran
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kelola semua materi pembelajaran untuk siswa
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/materi/add')}
          sx={{
            py: 1.5,
            px: 3,
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          Tambah Materi
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                    <Book sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold" color="primary.main">
                      {stats.totalMateri}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Materi
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 56, height: 56 }}>
                    <Publish sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold" color="success.main">
                      {stats.materiDipublikasi}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dipublikasi
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 56, height: 56 }}>
                    <School sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold" color="warning.main">
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
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 56, height: 56 }}>
                    <Person sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold" color="info.main">
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
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Cari Materi"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch} color="primary">
                    <Search />
                  </IconButton>
                ),
                sx: { borderRadius: 2 }
              }}
              placeholder="Cari berdasarkan judul, deskripsi, atau mata pelajaran..."
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ borderRadius: 2 }}
            >
              Filter
            </Button>
          </Grid>

          {showFilters && (
            <>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Mata Pelajaran</InputLabel>
                  <Select
                    value={filters.mataPelajaran}
                    onChange={(e) => handleFilterChange('mataPelajaran', e.target.value)}
                    label="Mata Pelajaran"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Semua</MenuItem>
                    <MenuItem value="Matematika">Matematika</MenuItem>
                    <MenuItem value="Bahasa Indonesia">Bahasa Indonesia</MenuItem>
                    <MenuItem value="Bahasa Inggris">Bahasa Inggris</MenuItem>
                    <MenuItem value="IPA">IPA</MenuItem>
                    <MenuItem value="IPS">IPS</MenuItem>
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
                    sx={{ borderRadius: 2 }}
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
                    value={filters.isPublished}
                    onChange={(e) => handleFilterChange('isPublished', e.target.value)}
                    label="Status"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Semua</MenuItem>
                    <MenuItem value="true">Dipublikasi</MenuItem>
                    <MenuItem value="false">Draft</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading Progress */}
      {isLoading && (
        <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
      )}

      {/* Table */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Materi</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mata Pelajaran</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Kelas</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Guru</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tanggal</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materi.map((materiItem) => (
                <React.Fragment key={materiItem._id}>
                  <TableRow hover sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 40, height: 40 }}>
                          <Book />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium" sx={{ cursor: 'pointer' }} onClick={() => toggleExpanded(materiItem._id)}>
                            {materiItem.judul}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {materiItem.deskripsi?.substring(0, 50)}...
                          </Typography>
                          <Box display="flex" alignItems="center" mt={0.5}>
                            {getFileTypeIcon(materiItem.fileType)}
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                              {materiItem.fileName} • {formatFileSize(materiItem.fileSize || 0)}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton size="small" onClick={() => toggleExpanded(materiItem._id)}>
                          {expandedMateri === materiItem._id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={materiItem.mataPelajaran} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={materiItem.kelas} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                          {materiItem.guru?.nama?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {materiItem.guru?.nama || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={materiItem.isPublished}
                            onChange={() => handleTogglePublish(materiItem)}
                            color="success"
                            size="small"
                          />
                        }
                        label={
                          <Chip
                            icon={getStatusIcon(materiItem.isPublished)}
                            label={materiItem.isPublished ? 'Dipublikasi' : 'Draft'}
                            size="small"
                            color={getStatusColor(materiItem.isPublished)}
                          />
                        }
                        labelPlacement="end"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          {new Date(materiItem.createdAt).toLocaleDateString('id-ID')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Lihat Detail">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/materi/${materiItem._id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleDownload(materiItem)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => navigate(`/materi/edit/${materiItem._id}`)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(materiItem)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Row */}
                  {expandedMateri === materiItem._id && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ bgcolor: 'grey.50', p: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Deskripsi Lengkap:
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {materiItem.deskripsi || 'Tidak ada deskripsi'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Informasi File:
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={1}>
                              <Box display="flex" alignItems="center">
                                <FileCopy sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  <strong>Nama File:</strong> {materiItem.fileName}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                <Category sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  <strong>Tipe File:</strong> {materiItem.fileType}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  <strong>Ukuran:</strong> {formatFileSize(materiItem.fileSize || 0)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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
          sx={{ bgcolor: 'grey.50' }}
        />
      </Paper>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            boxShadow: 4,
          }}
          onClick={() => navigate('/materi/add')}
        >
          <Add />
        </Fab>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus materi "{selectedMateri?.judul}"? 
            Tindakan ini tidak dapat dibatalkan dan file akan dihapus permanen.
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

export default MateriList;