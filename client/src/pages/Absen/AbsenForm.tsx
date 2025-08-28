import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Card,
  CardContent,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Save,
  Cancel,
  ArrowBack,
  Person,
  CalendarToday,
  Schedule,
  School,
  Class,
  Business,
  CheckCircle,
  Warning,
  Help,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { createAbsen, updateAbsen, fetchAbsenById } from '../../store/slices/absenSlice';
import { fetchSiswa } from '../../store/slices/siswaSlice';
import { RootState, AppDispatch } from '../../store';

const validationSchema = Yup.object({
  siswa: Yup.string()
    .required('Siswa wajib dipilih'),
  tanggal: Yup.date()
    .required('Tanggal wajib diisi')
    .max(new Date(), 'Tanggal tidak boleh melebihi hari ini'),
  status: Yup.string()
    .oneOf(['Hadir', 'Sakit', 'Izin', 'Alpha'], 'Status tidak valid')
    .required('Status wajib dipilih'),
  jamMasuk: Yup.string()
    .when('status', {
      is: 'Hadir',
      then: Yup.string().required('Jam masuk wajib diisi untuk siswa yang hadir'),
      otherwise: Yup.string().optional(),
    }),
  jamKeluar: Yup.string()
    .when('status', {
      is: 'Hadir',
      then: Yup.string().required('Jam keluar wajib diisi untuk siswa yang hadir'),
      otherwise: Yup.string().optional(),
    }),
  mataPelajaran: Yup.string()
    .required('Mata pelajaran wajib diisi'),
  kelas: Yup.string()
    .required('Kelas wajib diisi'),
  jurusan: Yup.string()
    .required('Jurusan wajib diisi'),
  semester: Yup.string()
    .required('Semester wajib diisi'),
  tahunAjaran: Yup.string()
    .required('Tahun ajaran wajib diisi'),
  keterangan: Yup.string()
    .when('status', {
      is: (status: string) => ['Sakit', 'Izin', 'Alpha'].includes(status),
      then: Yup.string().required('Keterangan wajib diisi untuk status ini'),
      otherwise: Yup.string().optional(),
    }),
});

const AbsenForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const { currentAbsen, isLoading, error } = useSelector((state: RootState) => state.absen);
  const { siswa } = useSelector((state: RootState) => state.siswa);

  const [selectedSiswa, setSelectedSiswa] = useState<any>(null);
  const [jamMasuk, setJamMasuk] = useState<Date | null>(null);
  const [jamKeluar, setJamKeluar] = useState<Date | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchAbsenById(id));
    }
    dispatch(fetchSiswa({ limit: 1000 })); // Fetch all students for dropdown
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (currentAbsen && isEditMode) {
      if (currentAbsen.jamMasuk) {
        setJamMasuk(new Date(`2000-01-01T${currentAbsen.jamMasuk}`));
      }
      if (currentAbsen.jamKeluar) {
        setJamKeluar(new Date(`2000-01-01T${currentAbsen.jamKeluar}`));
      }
      if (currentAbsen.siswa) {
        setSelectedSiswa(currentAbsen.siswa);
      }
    }
  }, [currentAbsen, isEditMode]);

  const formik = useFormik({
    initialValues: {
      siswa: currentAbsen?.siswa?._id || '',
      tanggal: currentAbsen?.tanggal ? new Date(currentAbsen.tanggal) : new Date(),
      status: currentAbsen?.status || 'Hadir',
      jamMasuk: currentAbsen?.jamMasuk || '',
      jamKeluar: currentAbsen?.jamKeluar || '',
      mataPelajaran: currentAbsen?.mataPelajaran || '',
      kelas: currentAbsen?.kelas || '',
      jurusan: currentAbsen?.jurusan || '',
      semester: currentAbsen?.semester || 'Ganjil',
      tahunAjaran: currentAbsen?.tahunAjaran || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      keterangan: currentAbsen?.keterangan || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const absenData = {
        ...values,
        jamMasuk: jamMasuk ? jamMasuk.toTimeString().slice(0, 5) : '',
        jamKeluar: jamKeluar ? jamKeluar.toTimeString().slice(0, 5) : '',
        tanggal: values.tanggal.toISOString().split('T')[0],
      };

      if (isEditMode && id) {
        dispatch(updateAbsen({ id, data: absenData }))
          .unwrap()
          .then(() => {
            navigate('/absen');
          });
      } else {
        dispatch(createAbsen(absenData))
          .unwrap()
          .then(() => {
            navigate('/absen');
          });
      }
    },
  });

  const handleSiswaChange = (event: any, newValue: any) => {
    setSelectedSiswa(newValue);
    if (newValue) {
      formik.setFieldValue('siswa', newValue._id);
      formik.setFieldValue('kelas', newValue.kelas);
      formik.setFieldValue('jurusan', newValue.jurusan);
    }
  };

  const handleCancel = () => {
    navigate('/absen');
  };

  const getStatusIcon = (status: string) => {
    const statusIcons: { [key: string]: any } = {
      'Hadir': <CheckCircle />,
      'Sakit': <Warning />,
      'Izin': <Help />,
      'Alpha': <CancelIcon />,
    };
    return statusIcons[status] || <Help />;
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

  const statusOptions = ['Hadir', 'Sakit', 'Izin', 'Alpha'];
  const semesterOptions = ['Ganjil', 'Genap'];
  const mataPelajaranOptions = [
    'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 
    'Pendidikan Agama', 'PJOK', 'Seni Budaya', 'Prakarya', 'Informatika'
  ];

  if (isLoading && isEditMode) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={handleCancel} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Data Absensi' : 'Tambah Data Absensi'}
        </Typography>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column - Main Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                Informasi Absensi
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={siswa}
                    getOptionLabel={(option) => `${option.nama} - ${option.nis} (${option.kelas} ${option.jurusan})`}
                    value={selectedSiswa}
                    onChange={handleSiswaChange}
                    disabled={isLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pilih Siswa"
                        required
                        error={formik.touched.siswa && Boolean(formik.errors.siswa)}
                        helperText={formik.touched.siswa && formik.errors.siswa}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Tanggal"
                    value={formik.values.tanggal}
                    onChange={(value) => formik.setFieldValue('tanggal', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: formik.touched.tanggal && Boolean(formik.errors.tanggal),
                        helperText: formik.touched.tanggal && formik.errors.tanggal,
                        disabled: isLoading,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.status && Boolean(formik.errors.status)}
                      disabled={isLoading}
                      label="Status"
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          <Box display="flex" alignItems="center">
                            {getStatusIcon(status)}
                            <Box ml={1}>{status}</Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {formik.touched.status && formik.errors.status && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {formik.errors.status}
                    </Typography>
                  )}
                </Grid>

                {formik.values.status === 'Hadir' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TimePicker
                        label="Jam Masuk"
                        value={jamMasuk}
                        onChange={setJamMasuk}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            error: formik.touched.jamMasuk && Boolean(formik.errors.jamMasuk),
                            helperText: formik.touched.jamMasuk && formik.errors.jamMasuk,
                            disabled: isLoading,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TimePicker
                        label="Jam Keluar"
                        value={jamKeluar}
                        onChange={setJamKeluar}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            error: formik.touched.jamKeluar && Boolean(formik.errors.jamKeluar),
                            helperText: formik.touched.jamKeluar && formik.errors.jamKeluar,
                            disabled: isLoading,
                          },
                        }}
                      />
                    </Grid>
                  </>
                )}

                {['Sakit', 'Izin', 'Alpha'].includes(formik.values.status) && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="keterangan"
                      name="keterangan"
                      label="Keterangan"
                      multiline
                      rows={3}
                      value={formik.values.keterangan}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.keterangan && Boolean(formik.errors.keterangan)}
                      helperText={formik.touched.keterangan && formik.errors.keterangan}
                      disabled={isLoading}
                      placeholder={`Masukkan alasan ${formik.values.status.toLowerCase()}`}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="mataPelajaran"
                    name="mataPelajaran"
                    label="Mata Pelajaran"
                    value={formik.values.mataPelajaran}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.mataPelajaran && Boolean(formik.errors.mataPelajaran)}
                    helperText={formik.touched.mataPelajaran && formik.errors.mataPelajaran}
                    disabled={isLoading}
                    required
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Academic Information */}
            <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <School sx={{ mr: 1 }} />
                Informasi Akademik
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="kelas"
                    name="kelas"
                    label="Kelas"
                    value={formik.values.kelas}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.kelas && Boolean(formik.errors.kelas)}
                    helperText={formik.touched.kelas && formik.errors.kelas}
                    disabled={isLoading}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="jurusan"
                    name="jurusan"
                    label="Jurusan"
                    value={formik.values.jurusan}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.jurusan && Boolean(formik.errors.jurusan)}
                    helperText={formik.touched.jurusan && formik.errors.jurusan}
                    disabled={isLoading}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="semester-label">Semester</InputLabel>
                    <Select
                      labelId="semester-label"
                      id="semester"
                      name="semester"
                      value={formik.values.semester}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.semester && Boolean(formik.errors.semester)}
                      disabled={isLoading}
                      label="Semester"
                    >
                      {semesterOptions.map((semester) => (
                        <MenuItem key={semester} value={semester}>
                          {semester}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {formik.touched.semester && formik.errors.semester && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {formik.errors.semester}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="tahunAjaran"
                    name="tahunAjaran"
                    label="Tahun Ajaran"
                    value={formik.values.tahunAjaran}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.tahunAjaran && Boolean(formik.errors.tahunAjaran)}
                    helperText={formik.touched.tahunAjaran && formik.errors.tahunAjaran}
                    disabled={isLoading}
                    required
                    placeholder="2023/2024"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Right Column - Student Info and Actions */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3}>
              {/* Student Information */}
              {selectedSiswa && (
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Informasi Siswa
                    </Typography>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: 24,
                          mr: 2,
                        }}
                      >
                        {selectedSiswa.nama.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="medium">
                          {selectedSiswa.nama}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          NIS: {selectedSiswa.nis}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <Class sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2">
                            {selectedSiswa.kelas}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <Business sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2">
                            {selectedSiswa.jurusan}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <School sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2">
                            Status: {selectedSiswa.status}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Aksi
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      startIcon={<Save />}
                      disabled={isLoading}
                      size="large"
                    >
                      {isLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        isEditMode ? 'Update Absensi' : 'Simpan Absensi'
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleCancel}
                      disabled={isLoading}
                      size="large"
                    >
                      Batal
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Quick Status Guide */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Panduan Status
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {statusOptions.map((status) => (
                      <Box key={status} display="flex" alignItems="center">
                        <Chip
                          icon={getStatusIcon(status)}
                          label={status}
                          size="small"
                          color={getStatusColor(status)}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {status === 'Hadir' && 'Siswa hadir di kelas'}
                          {status === 'Sakit' && 'Siswa tidak hadir karena sakit'}
                          {status === 'Izin' && 'Siswa tidak hadir dengan izin'}
                          {status === 'Alpha' && 'Siswa tidak hadir tanpa keterangan'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AbsenForm;