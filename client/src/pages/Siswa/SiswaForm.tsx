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
  Avatar,
  IconButton,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Save,
  Cancel,
  ArrowBack,
  PhotoCamera,
  Person,
  School,
  Class,
  Business,
  CalendarToday,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createSiswa, updateSiswa, fetchSiswaById } from '../../store/slices/siswaSlice';
import { RootState, AppDispatch } from '../../store';

const validationSchema = Yup.object({
  nis: Yup.string()
    .required('NIS wajib diisi')
    .min(5, 'NIS minimal 5 karakter')
    .max(20, 'NIS maksimal 20 karakter'),
  nama: Yup.string()
    .required('Nama wajib diisi')
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  tempatLahir: Yup.string()
    .required('Tempat lahir wajib diisi'),
  tanggalLahir: Yup.date()
    .required('Tanggal lahir wajib diisi')
    .max(new Date(), 'Tanggal lahir tidak boleh melebihi hari ini'),
  jenisKelamin: Yup.string()
    .oneOf(['L', 'P'], 'Jenis kelamin tidak valid')
    .required('Jenis kelamin wajib dipilih'),
  alamat: Yup.string()
    .required('Alamat wajib diisi')
    .min(10, 'Alamat minimal 10 karakter'),
  noTelp: Yup.string()
    .required('Nomor telepon wajib diisi')
    .matches(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid'),
  email: Yup.string()
    .email('Email tidak valid')
    .required('Email wajib diisi'),
  kelas: Yup.string()
    .required('Kelas wajib dipilih'),
  jurusan: Yup.string()
    .required('Jurusan wajib dipilih'),
  tahunMasuk: Yup.number()
    .required('Tahun masuk wajib diisi')
    .min(2000, 'Tahun masuk minimal 2000')
    .max(new Date().getFullYear() + 1, 'Tahun masuk tidak boleh melebihi tahun depan'),
  status: Yup.string()
    .required('Status wajib dipilih'),
  namaAyah: Yup.string()
    .required('Nama ayah wajib diisi'),
  namaIbu: Yup.string()
    .required('Nama ibu wajib diisi'),
  pekerjaanAyah: Yup.string()
    .required('Pekerjaan ayah wajib diisi'),
  pekerjaanIbu: Yup.string()
    .required('Pekerjaan ibu wajib diisi'),
  alamatOrangTua: Yup.string()
    .required('Alamat orang tua wajib diisi'),
  noTelpOrangTua: Yup.string()
    .required('Nomor telepon orang tua wajib diisi')
    .matches(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid'),
});

const SiswaForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const { currentSiswa, isLoading, error } = useSelector((state: RootState) => state.siswa);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchSiswaById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (currentSiswa && isEditMode) {
      setPreviewUrl(currentSiswa.foto || '');
    }
  }, [currentSiswa, isEditMode]);

  const formik = useFormik({
    initialValues: {
      nis: currentSiswa?.nis || '',
      nama: currentSiswa?.nama || '',
      tempatLahir: currentSiswa?.tempatLahir || '',
      tanggalLahir: currentSiswa?.tanggalLahir ? new Date(currentSiswa.tanggalLahir) : null,
      jenisKelamin: currentSiswa?.jenisKelamin || '',
      alamat: currentSiswa?.alamat || '',
      noTelp: currentSiswa?.noTelp || '',
      email: currentSiswa?.email || '',
      kelas: currentSiswa?.kelas || '',
      jurusan: currentSiswa?.jurusan || '',
      tahunMasuk: currentSiswa?.tahunMasuk || new Date().getFullYear(),
      status: currentSiswa?.status || 'Aktif',
      namaAyah: currentSiswa?.namaAyah || '',
      namaIbu: currentSiswa?.namaIbu || '',
      pekerjaanAyah: currentSiswa?.pekerjaanAyah || '',
      pekerjaanIbu: currentSiswa?.pekerjaanIbu || '',
      alamatOrangTua: currentSiswa?.alamatOrangTua || '',
      noTelpOrangTua: currentSiswa?.noTelpOrangTua || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const formData = new FormData();
      
      // Append all form values
      Object.keys(values).forEach(key => {
        if (values[key as keyof typeof values] !== null) {
          if (key === 'tanggalLahir' && values[key]) {
            formData.append(key, values[key].toISOString());
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      // Append file if selected
      if (selectedFile) {
        formData.append('foto', selectedFile);
      }

      if (isEditMode && id) {
        dispatch(updateSiswa({ id, data: formData }))
          .unwrap()
          .then(() => {
            navigate('/siswa');
          });
      } else {
        dispatch(createSiswa(formData))
          .unwrap()
          .then(() => {
            navigate('/siswa');
          });
      }
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    navigate('/siswa');
  };

  const kelasOptions = ['X', 'XI', 'XII'];
  const jurusanOptions = ['IPA', 'IPS', 'Bahasa', 'Agama', 'Teknik', 'Ekonomi', 'Seni'];
  const statusOptions = ['Aktif', 'Tidak Aktif', 'Lulus', 'Pindah'];
  const tahunOptions = Array.from(
    { length: 25 },
    (_, i) => new Date().getFullYear() - 10 + i
  );

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
          {isEditMode ? 'Edit Data Siswa' : 'Tambah Data Siswa'}
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
          {/* Left Column - Personal Information */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                Informasi Pribadi
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="nis"
                    name="nis"
                    label="NIS"
                    value={formik.values.nis}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.nis && Boolean(formik.errors.nis)}
                    helperText={formik.touched.nis && formik.errors.nis}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="nama"
                    name="nama"
                    label="Nama Lengkap"
                    value={formik.values.nama}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.nama && Boolean(formik.errors.nama)}
                    helperText={formik.touched.nama && formik.errors.nama}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="tempatLahir"
                    name="tempatLahir"
                    label="Tempat Lahir"
                    value={formik.values.tempatLahir}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.tempatLahir && Boolean(formik.errors.tempatLahir)}
                    helperText={formik.touched.tempatLahir && formik.errors.tempatLahir}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Tanggal Lahir"
                    value={formik.values.tanggalLahir}
                    onChange={(value) => formik.setFieldValue('tanggalLahir', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: formik.touched.tanggalLahir && Boolean(formik.errors.tanggalLahir),
                        helperText: formik.touched.tanggalLahir && formik.errors.tanggalLahir,
                        disabled: isLoading,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="jenis-kelamin-label">Jenis Kelamin</InputLabel>
                    <Select
                      labelId="jenis-kelamin-label"
                      id="jenisKelamin"
                      name="jenisKelamin"
                      value={formik.values.jenisKelamin}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.jenisKelamin && Boolean(formik.errors.jenisKelamin)}
                      disabled={isLoading}
                      label="Jenis Kelamin"
                    >
                      <MenuItem value="L">Laki-laki</MenuItem>
                      <MenuItem value="P">Perempuan</MenuItem>
                    </Select>
                  </FormControl>
                  {formik.touched.jenisKelamin && formik.errors.jenisKelamin && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {formik.errors.jenisKelamin}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="noTelp"
                    name="noTelp"
                    label="Nomor Telepon"
                    value={formik.values.noTelp}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.noTelp && Boolean(formik.errors.noTelp)}
                    helperText={formik.touched.noTelp && formik.errors.noTelp}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="alamat"
                    name="alamat"
                    label="Alamat"
                    multiline
                    rows={3}
                    value={formik.values.alamat}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.alamat && Boolean(formik.errors.alamat)}
                    helperText={formik.touched.alamat && formik.errors.alamat}
                    disabled={isLoading}
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
                          {kelas}
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
                          {jurusan}
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
                    <InputLabel id="tahun-masuk-label">Tahun Masuk</InputLabel>
                    <Select
                      labelId="tahun-masuk-label"
                      id="tahunMasuk"
                      name="tahunMasuk"
                      value={formik.values.tahunMasuk}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.tahunMasuk && Boolean(formik.errors.tahunMasuk)}
                      disabled={isLoading}
                      label="Tahun Masuk"
                    >
                      {tahunOptions.map((tahun) => (
                        <MenuItem key={tahun} value={tahun}>
                          {tahun}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {formik.touched.tahunMasuk && formik.errors.tahunMasuk && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {formik.errors.tahunMasuk}
                    </Typography>
                  )}
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
                          {status}
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
              </Grid>
            </Paper>

            {/* Parent Information */}
            <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                Informasi Orang Tua
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="namaAyah"
                    name="namaAyah"
                    label="Nama Ayah"
                    value={formik.values.namaAyah}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.namaAyah && Boolean(formik.errors.namaAyah)}
                    helperText={formik.touched.namaAyah && formik.errors.namaAyah}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="namaIbu"
                    name="namaIbu"
                    label="Nama Ibu"
                    value={formik.values.namaIbu}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.namaIbu && Boolean(formik.errors.namaIbu)}
                    helperText={formik.touched.namaIbu && formik.errors.namaIbu}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="pekerjaanAyah"
                    name="pekerjaanAyah"
                    label="Pekerjaan Ayah"
                    value={formik.values.pekerjaanAyah}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.pekerjaanAyah && Boolean(formik.errors.pekerjaanAyah)}
                    helperText={formik.touched.pekerjaanAyah && formik.errors.pekerjaanAyah}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="pekerjaanIbu"
                    name="pekerjaanIbu"
                    label="Pekerjaan Ibu"
                    value={formik.values.pekerjaanIbu}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.pekerjaanIbu && Boolean(formik.errors.pekerjaanIbu)}
                    helperText={formik.touched.pekerjaanIbu && formik.errors.pekerjaanIbu}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="noTelpOrangTua"
                    name="noTelpOrangTua"
                    label="Nomor Telepon Orang Tua"
                    value={formik.values.noTelpOrangTua}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.noTelpOrangTua && Boolean(formik.errors.noTelpOrangTua)}
                    helperText={formik.touched.noTelpOrangTua && formik.errors.noTelpOrangTua}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="alamatOrangTua"
                    name="alamatOrangTua"
                    label="Alamat Orang Tua"
                    multiline
                    rows={3}
                    value={formik.values.alamatOrangTua}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.alamatOrangTua && Boolean(formik.errors.alamatOrangTua)}
                    helperText={formik.touched.alamatOrangTua && formik.errors.alamatOrangTua}
                    disabled={isLoading}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Right Column - Photo and Actions */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3}>
              {/* Photo Upload */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Foto Siswa
                  </Typography>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Avatar
                      src={previewUrl}
                      sx={{ width: 150, height: 150, mb: 2 }}
                    >
                      <Person sx={{ fontSize: 80 }} />
                    </Avatar>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="photo-upload"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="photo-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCamera />}
                        disabled={isLoading}
                      >
                        Pilih Foto
                      </Button>
                    </label>
                  </Box>
                </Paper>
              </Grid>

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
                        isEditMode ? 'Update Siswa' : 'Simpan Siswa'
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
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SiswaForm;