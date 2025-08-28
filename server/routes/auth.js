const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Middleware untuk verifikasi token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Middleware untuk admin only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Register user baru
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username minimal 3 karakter'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('nama').notEmpty().withMessage('Nama harus diisi'),
  body('role').isIn(['admin', 'siswa', 'guru']).withMessage('Role tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, nama, role, nis, kelas, jurusan } = req.body;

    // Cek apakah username atau email sudah ada
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username atau email sudah terdaftar' 
      });
    }

    // Buat user baru
    const user = new User({
      username,
      email,
      password,
      nama,
      role,
      nis,
      kelas,
      jurusan
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User berhasil dibuat',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        nama: user.nama,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('username').notEmpty().withMessage('Username harus diisi'),
  body('password').notEmpty().withMessage('Password harus diisi')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Cari user berdasarkan username atau email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Username atau password salah' });
    }

    // Verifikasi password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Username atau password salah' });
    }

    // Cek apakah user aktif
    if (!user.isActive) {
      return res.status(400).json({ message: 'Akun tidak aktif' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        nama: user.nama,
        role: user.role,
        kelas: user.kelas,
        jurusan: user.jurusan
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile user yang sedang login
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile user
router.put('/profile', auth, [
  body('nama').notEmpty().withMessage('Nama harus diisi'),
  body('email').isEmail().withMessage('Email tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nama, email, kelas, jurusan } = req.body;

    // Cek apakah email sudah digunakan user lain
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: req.user._id } 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nama, email, kelas, jurusan },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile berhasil diupdate',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Password lama harus diisi'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Verifikasi password lama
    const isPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password lama salah' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password berhasil diubah' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout (client side akan menghapus token)
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logout berhasil' });
});

module.exports = { router, auth, adminOnly };