import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { register } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username minimal 3 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .required('Username wajib diisi'),
  email: Yup.string()
    .email('Email tidak valid')
    .required('Email wajib diisi'),
  password: Yup.string()
    .min(6, 'Password minimal 6 karakter')
    .required('Password wajib diisi'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
  nama: Yup.string()
    .min(2, 'Nama minimal 2 karakter')
    .required('Nama wajib diisi'),
  role: Yup.string()
    .oneOf(['admin', 'guru', 'siswa'], 'Role tidak valid')
    .required('Role wajib dipilih'),
  nis: Yup.string().when('role', {
    is: 'siswa',
    then: Yup.string().required('NIS wajib diisi untuk siswa'),
    otherwise: Yup.string().optional(),
  }),
  kelas: Yup.string().when('role', {
    is: 'siswa',
    then: Yup.string().required('Kelas wajib dipilih untuk siswa'),
    otherwise: Yup.string().optional(),
  }),
  jurusan: Yup.string().when('role', {
    is: 'siswa',
    then: Yup.string().required('Jurusan wajib dipilih untuk siswa'),
    otherwise: Yup.string().optional(),
  }),
});

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      nama: '',
      role: '',
      nis: '',
      kelas: '',
      jurusan: '',
    },
    validationSchema,
    onSubmit: (values) => {
      const { confirmPassword, ...registerData } = values;
      dispatch(register(registerData))
        .unwrap()
        .then(() => {
          navigate('/dashboard');
        })
        .catch(() => {
          // Error handling is done in the slice
        });
    },
  });

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const kelasOptions = [
    'X', 'XI', 'XII'
  ];

  const jurusanOptions = [
    'IPA', 'IPS', 'Bahasa', 'Agama', 'Teknik', 'Ekonomi', 'Seni'
  ];

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Daftar Akun Baru
          </Typography>
          
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Silakan lengkapi data diri Anda untuk membuat akun baru
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
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

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.role && Boolean(formik.errors.role)}
                    disabled={isLoading}
                    label="Role"
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="guru">Guru</MenuItem>
                    <MenuItem value="siswa">Siswa</MenuItem>
                  </Select>
                </FormControl>
                {formik.touched.role && formik.errors.role && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {formik.errors.role}
                  </Typography>
                )}
              </Grid>

              {formik.values.role === 'siswa' && (
                <>
                  <Grid item xs={12}>
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

                  <Grid item xs={6}>
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

                  <Grid item xs={6}>
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
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Konfirmasi Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleToggleConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Daftar'
              )}
            </Button>

            <Grid container justifyContent="center">
              <Grid item>
                <Typography variant="body2">
                  Sudah punya akun?{' '}
                  <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
                    Masuk di sini
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;