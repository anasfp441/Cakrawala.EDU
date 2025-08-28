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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save,
  Cancel,
  ArrowBack,
  Schedule,
  School,
  Class,
  Business,
  Person,
  Room,
  AccessTime,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { createJadwal, updateJadwal, fetchJadwalById } from '../../store/slices/jadwalSlice';
import { fetchSiswa } from '../../store/slices/siswaSlice';
import { RootState, AppDispatch } from '../../store';

const validationSchema = Yup.object({
  hari: Yup.string()
    .required('Hari wajib dipilih'),
  jamMulai: Yup.date()
    .required('Jam mulai wajib diisi')
    .nullable(),
  jamSelesai: Yup.date()
    .required('Jam selesai wajib diisi')
    .nullable()
    .test('jam-selesai', 'Jam selesai harus setelah jam mulai', function(value) {
      const { jamMulai } = this.parent;
      if (!jamMulai || !value) return true;
      return value > jamMulai;
    }),
  mataPelajaran: Yup.string()
    .required('Mata pelajaran wajib diisi'),
  kelas: Yup.string()
    .required('Kelas wajib dipilih'),
  jurusan: Yup.string()
    .required('Jurusan wajib dipilih'),
  guru: Yup.string()
    .required('Guru wajib dipilih'),
  ruangan: Yup.string()
    .required('Ruangan wajib diisi'),
  semester: Yup.string()
    .required('Semester wajib dipilih'),
  tahunAjaran: Yup.string()
    .required('Tahun ajaran wajib diisi'),
});

const JadwalForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const { currentJadwal, isLoading, error } = useSelector((state: RootState) => state.jadwal);
  const { siswa } = useSelector((state: RootState) => state.siswa);

  const [jamMulai, setJamMulai] = useState<Date | null>(null);
  const [jamSelesai, setJamSelesai] = useState<Date | null>(null);
  const [selectedGuru, setSelectedGuru] = useState<any>(null);
  const [durasi, setDurasi] = useState<number>(0);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchJadwalById(id));
    }
    // Fetch all users with guru role
    dispatch(fetchSiswa({ limit: 1000, role: 'guru' }));
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (currentJadwal && isEditMode) {
      if (currentJadwal.jamMulai) {
        setJamMulai(new Date(`2000-01-01T${currentJadwal.jamMulai}`));
      }
      if (currentJadwal.jamSelesai) {
        setJamSelesai(new Date(`2000-01-01T${currentJadwal.jamSelesai}`));
      }
      if (currentJadwal.guru) {
        setSelectedGuru(currentJadwal.guru);
      }
      if (currentJadwal.durasi) {
        setDurasi(currentJadwal.durasi);
      }
    }
  }, [currentJadwal, isEditMode]);

  // Calculate duration when time changes
  useEffect(() => {
    if (jamMulai && jamSelesai) {
      const start = new Date(jamMulai);
      const end = new Date(jamSelesai);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / 60000);
      setDurasi(diffMins > 0 ? diffMins : 0);
    }
  }, [jamMulai, jamSelesai]);

  const formik = useFormik({
    initialValues: {
      hari: currentJadwal?.hari || '',
      jamMulai: null,
      jamSelesai: null,
      mataPelajaran: currentJadwal?.mataPelajaran || '',
      kelas: currentJadwal?.kelas || '',
      jurusan: currentJadwal?.jurusan || '',
      guru: currentJadwal?.guru?._id || '',
      ruangan: currentJadwal?.ruangan || '',
      semester: currentJadwal?.semester || 'Ganjil',
      tahunAjaran: currentJadwal?.tahunAjaran || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      isActive: currentJadwal?.isActive ?? true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (!jamMulai || !jamSelesai) {
        return;
      }
      
      const jadwalData = {
        ...values,
        jamMulai: jamMulai.toTimeString().slice(0, 5),
        jamSelesai: jamSelesai.toTimeString().slice(0, 5),
        durasi: durasi,
      };

      if (isEditMode && id) {
        dispatch(updateJadwal({ id, data: jadwalData }))
          .unwrap()
          .then(() => {
            navigate('/jadwal');
          });
      } else {
        dispatch(createJadwal(jadwalData))
          .unwrap()
          .then(() => {
            navigate('/jadwal');
          });
      }
    },
  });

  const handleGuruChange = (event: any, newValue: any) => {
    setSelectedGuru(newValue);
    if (newValue) {
      formik.setFieldValue('guru', newValue._id);
    }
  };

  const handleCancel = () => {
    navigate('/jadwal');
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

  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const kelasOptions = ['X', 'XI', 'XII'];
  const jurusanOptions = ['IPA', 'IPS', 'Bahasa', 'Agama', 'Teknik', 'Ekonomi', 'Seni'];
  const semesterOptions = ['Ganjil', 'Genap'];
  const mataPelajaranOptions = [
    'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 
    'Pendidikan Agama', 'PJOK', 'Seni Budaya', 'Prakarya', 'Informatika',
    'Sejarah', 'Geografi', 'Ekonomi', 'Sosiologi', 'Fisika', 'Kimia', 'Biologi'
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
        <IconButton 
          onClick={handleCancel} 
          sx={{ 
            mr: 2,
            bgcolor: 'grey.100',
            '&:hover': { bgcolor: 'grey.200' }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
            {isEditMode ? 'Edit Data Jadwal' : 'Tambah Data Jadwal'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditMode ? 'Perbarui informasi jadwal yang sudah ada' : 'Buat jadwal baru untuk kelas dan mata pelajaran'}
          </Typography>
        </Box>
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
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                Informasi Jadwal
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="hari-label">Hari</InputLabel>
                    <Select
                      labelId="hari-label"
                      id="hari"
                      name="hari"
                      value={formik.values.hari}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.hari && Boolean(formik.errors.hari)}
                      disabled={isLoading}
                      label="Hari"
                                         >
                       {hariOptions.map((hari) => (
                         <MenuItem key={hari} value={hari}>
                           <Box display="flex" alignItems="center">
                             <Chip
                               label={hari}
                               size="small"
                               color={getHariColor(hari)}
                               sx={{ mr: 1, minWidth: 60 }}
                             />
                             <Typography variant="body2" fontWeight="medium">
                               {hari}
                             </Typography>
                           </Box>
                         </MenuItem>
                       ))}
                    </Select>
                  </FormControl>
                  {formik.touched.hari && formik.errors.hari && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {formik.errors.hari}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="mata-pelajaran-label">Mata Pelajaran</InputLabel>
                    <Select
                      labelId="mata-pelajaran-label"
                      id="mataPelajaran"
                      name="mataPelajaran"
                      value={formik.values.mataPelajaran}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.mataPelajaran && Boolean(formik.errors.mataPelajaran)}
                      disabled={isLoading}
                      label="Mata Pelajaran"
                                         >
                       {mataPelajaranOptions.map((mapel) => (
                         <MenuItem key={mapel} value={mapel}>
                           <Box display="flex" alignItems="center">
                             <School sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                             <Typography variant="body2">
                               {mapel}
                             </Typography>
                           </Box>
                         </MenuItem>
                       ))}
                    </Select>
                  </FormControl>
                  {formik.touched.mataPelajaran && formik.errors.mataPelajaran && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {formik.errors.mataPelajaran}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label="Jam Mulai"
                    value={jamMulai}
                    onChange={(newValue) => {
                      setJamMulai(newValue);
                      formik.setFieldValue('jamMulai', newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: formik.touched.jamMulai && Boolean(formik.errors.jamMulai),
                        helperText: formik.touched.jamMulai && formik.errors.jamMulai,
                        disabled: isLoading,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label="Jam Selesai"
                    value={jamSelesai}
                    onChange={(newValue) => {
                      setJamSelesai(newValue);
                      formik.setFieldValue('jamSelesai', newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: formik.touched.jamSelesai && Boolean(formik.errors.jamSelesai),
                        helperText: formik.touched.jamSelesai && formik.errors.jamSelesai,
                        disabled: isLoading,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="durasi"
                    name="durasi"
                    label="Durasi (menit)"
                    value={durasi > 0 ? `${durasi} menit` : '-'}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    helperText={durasi > 0 ? `Durasi: ${durasi} menit` : 'Pilih jam mulai dan selesai'}
                    color={durasi > 0 ? 'success' : 'default'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="ruangan"
                    name="ruangan"
                    label="Ruangan"
                    value={formik.values.ruangan}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.ruangan && Boolean(formik.errors.ruangan)}
                    helperText={formik.touched.ruangan && formik.errors.ruangan}
                    disabled={isLoading}
                    required
                    placeholder="Contoh: Lab 1, Ruang 101"
                    InputProps={{
                      startAdornment: <Room sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    options={siswa.filter(s => s.role === 'guru')}
                    getOptionLabel={(option) => `${option.nama} - ${option.email}`}
                    value={selectedGuru}
                    onChange={handleGuruChange}
                    disabled={isLoading}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box display="flex" alignItems="center">
                          <Person sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {option.nama}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pilih Guru"
                        required
                        error={formik.touched.guru && Boolean(formik.errors.guru)}
                        helperText={formik.touched.guru && formik.errors.guru}
                        placeholder="Ketik nama guru..."
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Academic Information */}
            <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <School sx={{ mr: 1, color: 'secondary.main' }} />
                Informasi Akademik
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="kelas-label">Kelas</InputLabel>
                    <Select
                      labelId="kelas-label"
                      id="kelas"
                      name="kelas"
                      value={formik.values.kelas}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.kelas && Boolean(formik.errors.kelas)}
                      disabled={isLoading}
                      label="Kelas"
                                         >
                       {kelasOptions.map((kelas) => (
                         <MenuItem key={kelas} value={kelas}>
                           <Box display="flex" alignItems="center">
                             <Class sx={{ mr: 1, color: 'secondary.main', fontSize: 20 }} />
                             <Typography variant="body2" fontWeight="medium">
                               Kelas {kelas}
                             </Typography>
                           </Box>
                         </MenuItem>
                       ))}
                    </Select>
                  </FormControl>
                  {formik.touched.kelas && formik.errors.kelas && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {formik.errors.kelas}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="jurusan-label">Jurusan</InputLabel>
                    <Select
                      labelId="jurusan-label"
                      id="jurusan"
                      name="jurusan"
                      value={formik.values.jurusan}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.jurusan && Boolean(formik.errors.jurusan)}
                      disabled={isLoading}
                      label="Jurusan"
                                         >
                       {jurusanOptions.map((jurusan) => (
                         <MenuItem key={jurusan} value={jurusan}>
                           <Box display="flex" alignItems="center">
                             <Business sx={{ mr: 1, color: 'info.main', fontSize: 20 }} />
                             <Typography variant="body2" fontWeight="medium">
                               {jurusan}
                             </Typography>
                           </Box>
                         </MenuItem>
                       ))}
                    </Select>
                  </FormControl>
                  {formik.touched.jurusan && formik.errors.jurusan && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {formik.errors.jurusan}
                    </Typography>
                  )}
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
                           <Box display="flex" alignItems="center">
                             <Chip
                               label={semester}
                               size="small"
                               color={semester === 'Ganjil' ? 'primary' : 'secondary'}
                               sx={{ mr: 1 }}
                             />
                             <Typography variant="body2">
                               Semester {semester}
                             </Typography>
                           </Box>
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
                    InputProps={{
                      startAdornment: <School sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Right Column - Settings and Actions */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3}>
              {/* Schedule Settings */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                    Pengaturan Jadwal
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" flexDirection="column" gap={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.isActive}
                          onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                          color="success"
                          size="medium"
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          {formik.values.isActive ? (
                            <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                          ) : (
                            <Warning sx={{ color: 'warning.main', mr: 1 }} />
                          )}
                          <Typography variant="body2" fontWeight="medium">
                            {formik.values.isActive ? 'Jadwal Aktif' : 'Jadwal Tidak Aktif'}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: formik.values.isActive ? 'success.light' : 'warning.light',
                      borderRadius: 1,
                      border: `1px solid ${formik.values.isActive ? 'success.main' : 'warning.main'}`
                    }}>
                      <Typography variant="caption" color={formik.values.isActive ? 'success.dark' : 'warning.dark'}>
                        {formik.values.isActive 
                          ? 'Jadwal ini akan muncul di kalender siswa dan guru'
                          : 'Jadwal ini tidak akan muncul di kalender dan tidak dapat diakses'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Save sx={{ mr: 1, color: 'primary.main' }} />
                    Aksi
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                      disabled={isLoading}
                      size="large"
                      sx={{
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        fontSize: '1rem'
                      }}
                    >
                      {isLoading ? 'Menyimpan...' : (isEditMode ? 'Update Jadwal' : 'Simpan Jadwal')}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleCancel}
                      disabled={isLoading}
                      size="large"
                      sx={{
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '1rem'
                      }}
                    >
                      Batal
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Quick Guide */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ mr: 1, color: 'warning.main' }} />
                    Panduan
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'info.light', 
                      borderRadius: 1,
                      border: '1px solid info.main'
                    }}>
                      <Typography variant="body2" color="info.dark" sx={{ mb: 1, fontWeight: 'medium' }}>
                        Tips Pengisian:
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        <Typography component="li" variant="body2" color="info.dark" sx={{ mb: 0.5 }}>
                          Pastikan tidak ada konflik jadwal dengan kelas dan guru yang sama
                        </Typography>
                        <Typography component="li" variant="body2" color="info.dark" sx={{ mb: 0.5 }}>
                          Durasi akan dihitung otomatis dari jam mulai dan selesai
                        </Typography>
                        <Typography component="li" variant="body2" color="info.dark" sx={{ mb: 0.5 }}>
                          Jadwal yang tidak aktif tidak akan muncul di kalender siswa
                        </Typography>
                        <Typography component="li" variant="body2" color="info.dark">
                          Gunakan ruangan yang tersedia dan tidak bentrok dengan jadwal lain
                        </Typography>
                      </Box>
                    </Box>
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

export default JadwalForm;