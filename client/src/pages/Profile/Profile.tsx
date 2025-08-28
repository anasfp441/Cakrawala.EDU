import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  School,
  Class,
  Business,
} from '@mui/icons-material';
import { getProfile, updateProfile, changePassword } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

const profileValidationSchema = Yup.object({
  nama: Yup.string()
    .min(2, 'Nama minimal 2 karakter')
    .required('Nama wajib diisi'),
  email: Yup.string()
    .email('Email tidak valid')
    .required('Email wajib diisi'),
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

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Password saat ini wajib diisi'),
  newPassword: Yup.string()
    .min(6, 'Password minimal 6 karakter')
    .required('Password baru wajib diisi'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
});

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  const profileFormik = useFormik({
    initialValues: {
      nama: user?.nama || '',
      email: user?.email || '',
      nis: user?.nis || '',
      kelas: user?.kelas || '',
      jurusan: user?.jurusan || '',
    },
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      dispatch(updateProfile(values))
        .unwrap()
        .then(() => {
          setSuccessMessage('Profil berhasil diupdate');
          setIsEditing(false);
          setTimeout(() => setSuccessMessage(''), 3000);
        })
        .catch(() => {
          // Error handling is done in the slice
        });
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: (values) => {
      const { confirmPassword, ...passwordData } = values;
      dispatch(changePassword(passwordData))
        .unwrap()
        .then(() => {
          setSuccessMessage('Password berhasil diubah');
          setIsChangingPassword(false);
          passwordFormik.resetForm();
          setTimeout(() => setSuccessMessage(''), 3000);
        })
        .catch(() => {
          // Error handling is done in the slice
        });
    },
  });

  const handleCancelEdit = () => {
    setIsEditing(false);
    profileFormik.resetForm();
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    passwordFormik.resetForm();
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      admin: 'Administrator',
      guru: 'Guru',
      siswa: 'Siswa',
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      admin: 'error',
      guru: 'warning',
      siswa: 'info',
    };
    return roleColors[role as keyof typeof roleColors] || 'default';
  };

  const kelasOptions = ['X', 'XI', 'XII'];
  const jurusanOptions = ['IPA', 'IPS', 'Bahasa', 'Agama', 'Teknik', 'Ekonomi', 'Seni'];

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profil Pengguna
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar
                sx={{ width: 80, height: 80, mr: 2 }}
                src={user.foto}
              >
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {user.nama}
                </Typography>
                <Chip
                  label={getRoleLabel(user.role)}
                  color={getRoleColor(user.role) as any}
                  size="small"
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={profileFormik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="nama"
                    name="nama"
                    label="Nama Lengkap"
                    value={profileFormik.values.nama}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    error={profileFormik.touched.nama && Boolean(profileFormik.errors.nama)}
                    helperText={profileFormik.touched.nama && profileFormik.errors.nama}
                    disabled={!isEditing || isLoading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={profileFormik.values.email}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                    helperText={profileFormik.touched.email && profileFormik.errors.email}
                    disabled={!isEditing || isLoading}
                  />
                </Grid>

                {user.role === 'siswa' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="nis"
                        name="nis"
                        label="NIS"
                        value={profileFormik.values.nis}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        error={profileFormik.touched.nis && Boolean(profileFormik.errors.nis)}
                        helperText={profileFormik.touched.nis && profileFormik.errors.nis}
                        disabled={!isEditing || isLoading}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel id="kelas-label">Kelas</InputLabel>
                        <Select
                          labelId="kelas-label"
                          id="kelas"
                          name="kelas"
                          value={profileFormik.values.kelas}
                          onChange={profileFormik.handleChange}
                          onBlur={profileFormik.handleBlur}
                          error={profileFormik.touched.kelas && Boolean(profileFormik.errors.kelas)}
                          disabled={!isEditing || isLoading}
                          label="Kelas"
                        >
                          {kelasOptions.map((kelas) => (
                            <MenuItem key={kelas} value={kelas}>
                              {kelas}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {profileFormik.touched.kelas && profileFormik.errors.kelas && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          {profileFormik.errors.kelas}
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
                          value={profileFormik.values.jurusan}
                          onChange={profileFormik.handleChange}
                          onBlur={profileFormik.handleBlur}
                          error={profileFormik.touched.jurusan && Boolean(profileFormik.errors.jurusan)}
                          disabled={!isEditing || isLoading}
                          label="Jurusan"
                        >
                          {jurusanOptions.map((jurusan) => (
                            <MenuItem key={jurusan} value={jurusan}>
                              {jurusan}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {profileFormik.touched.jurusan && profileFormik.errors.jurusan && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          {profileFormik.errors.jurusan}
                        </Typography>
                      )}
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    {!isEditing ? (
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profil
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={isLoading}
                        >
                          {isLoading ? <CircularProgress size={20} /> : 'Simpan'}
                        </Button>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {/* User Stats */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informasi Akun
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Username: {user.username}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  {user.role === 'siswa' && (
                    <>
                      <Box display="flex" alignItems="center" mb={1}>
                        <School sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          NIS: {user.nis}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Class sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Kelas: {user.kelas}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Business sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Jurusan: {user.jurusan}
                        </Typography>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Change Password */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ubah Password
                  </Typography>
                  
                  {!isChangingPassword ? (
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Ubah Password
                    </Button>
                  ) : (
                    <Box component="form" onSubmit={passwordFormik.handleSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            id="currentPassword"
                            name="currentPassword"
                            label="Password Saat Ini"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordFormik.values.currentPassword}
                            onChange={passwordFormik.handleChange}
                            onBlur={passwordFormik.handleBlur}
                            error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                            helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                            disabled={isLoading}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    edge="end"
                                  >
                                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            id="newPassword"
                            name="newPassword"
                            label="Password Baru"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordFormik.values.newPassword}
                            onChange={passwordFormik.handleChange}
                            onBlur={passwordFormik.handleBlur}
                            error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                            helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                            disabled={isLoading}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    edge="end"
                                  >
                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
                            label="Konfirmasi Password Baru"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordFormik.values.confirmPassword}
                            onChange={passwordFormik.handleChange}
                            onBlur={passwordFormik.handleBlur}
                            error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                            helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                            disabled={isLoading}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                  >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Box display="flex" gap={1}>
                            <Button
                              variant="outlined"
                              fullWidth
                              onClick={handleCancelPassword}
                              disabled={isLoading}
                            >
                              Batal
                            </Button>
                            <Button
                              type="submit"
                              variant="contained"
                              fullWidth
                              disabled={isLoading}
                            >
                              {isLoading ? <CircularProgress size={20} /> : 'Ubah Password'}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;