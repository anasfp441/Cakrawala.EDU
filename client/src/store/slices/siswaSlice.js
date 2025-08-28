import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { siswaAPI } from '../../services/api';

// Async thunks
export const fetchSiswa = createAsyncThunk(
  'siswa/fetchSiswa',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await siswaAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data siswa');
    }
  }
);

export const fetchSiswaById = createAsyncThunk(
  'siswa/fetchSiswaById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await siswaAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data siswa');
    }
  }
);

export const createSiswa = createAsyncThunk(
  'siswa/createSiswa',
  async (siswaData, { rejectWithValue }) => {
    try {
      const response = await siswaAPI.create(siswaData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat siswa baru');
    }
  }
);

export const updateSiswa = createAsyncThunk(
  'siswa/updateSiswa',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await siswaAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengupdate data siswa');
    }
  }
);

export const deleteSiswa = createAsyncThunk(
  'siswa/deleteSiswa',
  async (id, { rejectWithValue }) => {
    try {
      await siswaAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menghapus siswa');
    }
  }
);

export const fetchSiswaStats = createAsyncThunk(
  'siswa/fetchSiswaStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await siswaAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil statistik siswa');
    }
  }
);

const initialState = {
  siswa: [],
  currentSiswa: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    kelas: '',
    jurusan: '',
    status: '',
    search: '',
  },
  isLoading: false,
  error: null,
  successMessage: null,
};

const siswaSlice = createSlice({
  name: 'siswa',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page when limit changes
    },
    clearCurrentSiswa: (state) => {
      state.currentSiswa = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch siswa
      .addCase(fetchSiswa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSiswa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.siswa = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchSiswa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch siswa by ID
      .addCase(fetchSiswaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSiswaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSiswa = action.payload;
      })
      .addCase(fetchSiswaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create siswa
      .addCase(createSiswa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSiswa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.siswa.unshift(action.payload);
        state.successMessage = 'Siswa berhasil ditambahkan';
        state.pagination.total += 1;
      })
      .addCase(createSiswa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update siswa
      .addCase(updateSiswa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSiswa.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.siswa.findIndex(siswa => siswa._id === action.payload._id);
        if (index !== -1) {
          state.siswa[index] = action.payload;
        }
        if (state.currentSiswa && state.currentSiswa._id === action.payload._id) {
          state.currentSiswa = action.payload;
        }
        state.successMessage = 'Data siswa berhasil diupdate';
      })
      .addCase(updateSiswa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete siswa
      .addCase(deleteSiswa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSiswa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.siswa = state.siswa.filter(siswa => siswa._id !== action.payload);
        if (state.currentSiswa && state.currentSiswa._id === action.payload) {
          state.currentSiswa = null;
        }
        state.successMessage = 'Siswa berhasil dihapus';
        state.pagination.total -= 1;
      })
      .addCase(deleteSiswa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchSiswaStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSiswaStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchSiswaStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccessMessage,
  setFilters,
  setPage,
  setLimit,
  clearCurrentSiswa,
} = siswaSlice.actions;

export default siswaSlice.reducer;