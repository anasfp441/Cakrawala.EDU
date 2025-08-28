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
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormHelperText,
  InputAdornment,
  AlertTitle,
} from '@mui/material';
import {
  Save,
  Cancel,
  ArrowBack,
  CloudUpload,
  School,
  Book,
  Person,
  Category,
  Description,
  FileUpload,
  CheckCircle,
  Warning,
  Info,
  Upload,
  Delete,
  Preview,
  Download,
  Edit,
  Add,
  Remove,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createMateri, updateMateri, fetchMateriById } from '../../store/slices/materiSlice';
import { fetchSiswa } from '../../store/slices/siswaSlice';
import { RootState, AppDispatch } from '../../store';

const validationSchema = Yup.object({
  judul: Yup.string()
    .required('Judul materi wajib diisi')
    .min(5, 'Judul minimal 5 karakter')
    .max(100, 'Judul maksimal 100 karakter'),
  deskripsi: Yup.string()
    .required('Deskripsi wajib diisi')
    .min(20, 'Deskripsi minimal 20 karakter')
    .max(500, 'Deskripsi maksimal 500 karakter'),
  mataPelajaran: Yup.string()
    .required('Mata pelajaran wajib dipilih'),
  kelas: Yup.string()
    .required('Kelas wajib dipilih'),
  jurusan: Yup.string()
    .required('Jurusan wajib dipilih'),
  guru: Yup.string()
    .required('Guru wajib dipilih'),
  semester: Yup.string()
    .required('Semester wajib dipilih'),
  tahunAjaran: Yup.string()
    .required('Tahun ajaran wajib diisi'),
  file: Yup.mixed()
    .when('isEditMode', {
      is: false,
      then: Yup.mixed().required('File materi wajib diupload'),
    }),
});

const steps = [
  'Informasi Dasar',
  'Detail Akademik',
  'Upload File',
  'Pengaturan & Publikasi'
];

const MateriForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const { currentMateri, isLoading, error } = useSelector((state: RootState) => state.materi);
  const { siswa } = useSelector((state: RootState) => state.siswa);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGuru, setSelectedGuru] = useState<any>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchMateriById(id));
    }
    dispatch(fetchSiswa({ limit: 1000, role: 'guru' }));
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (currentMateri && isEditMode) {
      if (currentMateri.guru) {
        setSelectedGuru(currentMateri.guru);
      }
      if (currentMateri.fileUrl) {
        setFilePreview(currentMateri.fileUrl);
      }
    }
  }, [currentMateri, isEditMode]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const formik = useFormik({
    initialValues: {
      judul: currentMateri?.judul || '',
      deskripsi: currentMateri?.deskripsi || '',
      mataPelajaran: currentMateri?.mataPelajaran || '',
      kelas: currentMateri?.kelas || '',
      jurusan: currentMateri?.jurusan || '',
      guru: currentMateri?.guru?._id || '',
      semester: currentMateri?.semester || 'Ganjil',
      tahunAjaran: currentMateri?.tahunAjaran || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      isPublished: currentMateri?.isPublished ?? false,
      tags: currentMateri?.tags || [],
      isEditMode: isEditMode,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (!isEditMode && !selectedFile) {
        formik.setFieldError('file', 'File materi wajib diupload');
        return;
      }

      const formData = new FormData();
      formData.append('judul', values.judul);
      formData.append('deskripsi', values.deskripsi);
      formData.append('mataPelajaran', values.mataPelajaran);
      formData.append('kelas', values.kelas);
      formData.append('jurusan', values.jurusan);
      formData.append('guru', values.guru);
      formData.append('semester', values.semester);
      formData.append('tahunAjaran', values.tahunAjaran);
      formData.append('isPublished', values.isPublished.toString());
      formData.append('tags', JSON.stringify(values.tags));
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (isEditMode && id) {
        dispatch(updateMateri({ id, data: formData }))
          .unwrap()
          .then(() => {
            navigate('/materi');
          });
      } else {
        dispatch(createMateri(formData))
          .unwrap()
          .then(() => {
            navigate('/materi');
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
    navigate('/materi');
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <Book sx={{ color: 'error.main' }} />;
      case 'doc':
      case 'docx':
        return <Book sx={{ color: 'primary.main' }} />;
      case 'ppt':
      case 'pptx':
        return <Book sx={{ color: 'warning.main' }} />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Book sx={{ color: 'secondary.main' }} />;
      default:
        return <Book sx={{ color: 'grey.500' }} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const mataPelajaranOptions = [
    'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 
    'Pendidikan Agama', 'PJOK', 'Seni Budaya', 'Prakarya', 'Informatika',
    'Sejarah', 'Geografi', 'Ekonomi', 'Sosiologi', 'Fisika', 'Kimia', 'Biologi'
  ];
  const kelasOptions = ['X', 'XI', 'XII'];
  const jurusanOptions = ['IPA', 'IPS', 'Bahasa', 'Agama', 'Teknik', 'Ekonomi', 'Seni'];
  const semesterOptions = ['Ganjil', 'Genap'];

  if (isLoading && isEditMode) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
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
            {isEditMode ? 'Edit Materi Pembelajaran' : 'Tambah Materi Pembelajaran'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditMode ? 'Perbarui informasi materi yang sudah ada' : 'Buat materi baru untuk pembelajaran siswa'}
          </Typography>
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              {isMobile && (
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    {/* Step content will be rendered below */}
                  </Box>
                </StepContent>
              )}
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Box component="form" onSubmit={formik.handleSubmit}>
        {/* Step 1: Informasi Dasar */}
        {activeStep === 0 && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Book sx={{ mr: 1, color: 'primary.main' }} />
              Informasi Dasar Materi
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="judul"
                  name="judul"
                  label="Judul Materi"
                  value={formik.values.judul}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.judul && Boolean(formik.errors.judul)}
                  helperText={formik.touched.judul && formik.errors.judul}
                  disabled={isLoading}
                  required
                  placeholder="Masukkan judul materi pembelajaran..."
                  InputProps={{
                    startAdornment: <Book sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="deskripsi"
                  name="deskripsi"
                  label="Deskripsi Materi"
                  value={formik.values.deskripsi}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.deskripsi && Boolean(formik.errors.deskripsi)}
                  helperText={`${formik.values.deskripsi.length}/500 karakter`}
                  disabled={isLoading}
                  required
                  multiline
                  rows={4}
                  placeholder="Jelaskan detail materi pembelajaran ini..."
                  InputProps={{
                    startAdornment: <Description sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
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
                  <FormHelperText error>{formik.errors.mataPelajaran}</FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="guru-label">Guru Pengampu</InputLabel>
                  <Select
                    labelId="guru-label"
                    id="guru"
                    name="guru"
                    value={formik.values.guru}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.guru && Boolean(formik.errors.guru)}
                    disabled={isLoading}
                    label="Guru Pengampu"
                  >
                    {siswa.filter(s => s.role === 'guru').map((guru) => (
                      <MenuItem key={guru._id} value={guru._id}>
                        <Box display="flex" alignItems="center">
                          <Person sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="body2">
                            {guru.nama}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formik.touched.guru && formik.errors.guru && (
                  <FormHelperText error>{formik.errors.guru}</FormHelperText>
                )}
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Step 2: Detail Akademik */}
        {activeStep === 1 && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <School sx={{ mr: 1, color: 'secondary.main' }} />
              Detail Akademik
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
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
                          <School sx={{ mr: 1, color: 'secondary.main', fontSize: 20 }} />
                          <Typography variant="body2" fontWeight="medium">
                            Kelas {kelas}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formik.touched.kelas && formik.errors.kelas && (
                  <FormHelperText error>{formik.errors.kelas}</FormHelperText>
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
                          <Category sx={{ mr: 1, color: 'info.main', fontSize: 20 }} />
                          <Typography variant="body2" fontWeight="medium">
                            {jurusan}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formik.touched.jurusan && formik.errors.jurusan && (
                  <FormHelperText error>{formik.errors.jurusan}</FormHelperText>
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
                  <FormHelperText error>{formik.errors.semester}</FormHelperText>
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
        )}

        {/* Step 3: Upload File */}
        {activeStep === 2 && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <FileUpload sx={{ mr: 1, color: 'primary.main' }} />
              Upload File Materi
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: selectedFile ? 'success.main' : 'grey.300',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    bgcolor: selectedFile ? 'success.light' : 'grey.50',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  {!selectedFile ? (
                    <Box>
                      <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Upload File Materi
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Drag & drop file di sini atau klik untuk memilih file
                      </Typography>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<Upload />}
                        sx={{ borderRadius: 2 }}
                      >
                        Pilih File
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                        />
                      </Button>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Format yang didukung: PDF, DOC, PPT, MP4, JPG, PNG (Max: 50MB)
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                        {getFileTypeIcon(selectedFile.type)}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {selectedFile.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Ukuran: {formatFileSize(selectedFile.size)}
                      </Typography>
                      <Box display="flex" gap={1} justifyContent="center">
                        <Button
                          variant="outlined"
                          startIcon={<Preview />}
                          onClick={() => {
                            if (filePreview) {
                              window.open(filePreview, '_blank');
                            }
                          }}
                          disabled={!filePreview}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={handleFileRemove}
                        >
                          Hapus
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>

              {formik.touched.file && formik.errors.file && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {formik.errors.file}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* Step 4: Pengaturan & Publikasi */}
        {activeStep === 3 && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
              Pengaturan & Publikasi
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.isPublished}
                      onChange={(e) => formik.setFieldValue('isPublished', e.target.checked)}
                      color="success"
                      size="medium"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      {formik.values.isPublished ? (
                        <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      ) : (
                        <Warning sx={{ color: 'warning.main', mr: 1 }} />
                      )}
                      <Typography variant="body2" fontWeight="medium">
                        {formik.values.isPublished ? 'Publikasikan Sekarang' : 'Simpan sebagai Draft'}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ 
                  p: 2, 
                  bgcolor: formik.values.isPublished ? 'success.light' : 'warning.light',
                  borderRadius: 1,
                  border: `1px solid ${formik.values.isPublished ? 'success.main' : 'warning.main'}`,
                  mt: 2
                }}>
                  <Typography variant="caption" color={formik.values.isPublished ? 'success.dark' : 'warning.dark'}>
                    {formik.values.isPublished 
                      ? 'Materi akan langsung tersedia untuk siswa dan dapat diakses'
                      : 'Materi disimpan sebagai draft dan tidak dapat diakses siswa sampai dipublikasikan'
                    }
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <AlertTitle>Informasi</AlertTitle>
                  <Typography variant="body2">
                    • Pastikan semua informasi sudah benar sebelum mempublikasikan
                  </Typography>
                  <Typography variant="body2">
                    • Materi yang dipublikasikan dapat diakses oleh siswa sesuai kelas dan jurusan
                  </Typography>
                  <Typography variant="body2">
                    • Anda dapat mengubah status publikasi kapan saja
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Navigation Buttons */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between">
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ borderRadius: 2 }}
            >
              Kembali
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    px: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  {isLoading ? 'Menyimpan...' : (isEditMode ? 'Update Materi' : 'Simpan Materi')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    py: 1.5,
                    px: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  Lanjutkan
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MateriForm;