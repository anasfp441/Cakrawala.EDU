import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Container,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School,
  Email,
  Lock,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { login, clearError } from '../../store/slices/authSlice';

const validationSchema = Yup.object({
  username: Yup.string()
    .required('Username atau email harus diisi'),
  password: Yup.string()
    .required('Password harus diisi')
    .min(6, 'Password minimal 6 karakter'),
});

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(login(values)).unwrap();
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } catch (error) {
      // Error already handled by the slice
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          {/* Logo dan Judul */}
          <Box sx={{ mb: 4 }}>
            <School
              sx={{
                fontSize: 64,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              CBT Sekolah
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sistem Pembelajaran Berbasis Komputer
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Form Login */}
          <Formik
            initialValues={{
              username: '',
              password: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form>
                <Box sx={{ mb: 3 }}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="username"
                    label="Username atau Email"
                    variant="outlined"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <Field
                    as={TextField}
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting || isLoading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  {isSubmitting || isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Masuk'
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          {/* Link Register */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Belum punya akun?{' '}
              <Link
                to="/register"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  fontWeight: 600,
                  color: '#1976d2',
                }}
              >
                Daftar di sini
              </Link>
            </Typography>
          </Box>

          {/* Demo Credentials */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Demo Credentials:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Admin: admin / admin123
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Guru: guru / guru123
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Siswa: siswa / siswa123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;