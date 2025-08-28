import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { Home, ArrowBack, Search } from '@mui/icons-material';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 6,
            borderRadius: 3,
            maxWidth: 500,
            width: '100%',
          }}
        >
          {/* 404 Icon */}
          <Box
            sx={{
              fontSize: '8rem',
              fontWeight: 'bold',
              color: 'primary.main',
              lineHeight: 1,
              mb: 2,
            }}
          >
            404
          </Box>

          {/* Error Message */}
          <Typography variant="h4" component="h1" gutterBottom color="text.primary">
            Halaman Tidak Ditemukan
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
            Silakan periksa URL atau gunakan tombol di bawah untuk kembali ke halaman utama.
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              justifyContent: 'center',
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              onClick={handleGoHome}
              sx={{ minWidth: 200 }}
            >
              Kembali ke Dashboard
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              sx={{ minWidth: 200 }}
            >
              Kembali Sebelumnya
            </Button>
          </Box>

          {/* Additional Help */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Jika Anda yakin ini adalah kesalahan, silakan hubungi administrator sistem.
            </Typography>
            
            <Button
              variant="text"
              size="small"
              startIcon={<Search />}
              onClick={() => navigate('/dashboard')}
              sx={{ mt: 1 }}
            >
              Cari Halaman Lain
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;