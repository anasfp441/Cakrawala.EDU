import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { absenAPI } from '../../services/api';

// Async thunks
export const fetchAbsen = createAsyncThunk(
  'absen/fetchAbsen',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await absenAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data absensi');
    }
  }
);

export const fetchAbsenById = createAsyncThunk(
  'absen/fetchAbsenById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await absenAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data absensi');
    }
  }
);

export const createAbsen = createAsyncThunk(
  'absen/createAbsen',
  async (absenData, { rejectWithValue }) => {
    try {
      const response = await absenAPI.create(absenData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat absensi baru');
    }
  }
);

export const updateAbsen = createAsyncThunk(
  'absen/updateAbsen',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await absenAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengupdate data absensi');
    }
  }
);

export const deleteAbsen = createAsyncThunk(
  'absen/deleteAbsen',
  async (id, { rejectWithValue }) => {
    try {
      await absenAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menghapus absensi');
    }
  }
);

export const createBulkAbsen = createAsyncThunk(
  'absen/createBulkAbsen',
  async (bulkData, { rejectWithValue }) => {
    try {
      const response = await absenAPI.createBulk(bulkData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat absensi bulk');
    }
  }
);

export const fetchAbsenStats = createAsyncThunk(
  'absen/fetchAbsenStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await absenAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil statistik absensi');
    }
  }
);

const initialState = {
  absen: [],
  currentAbsen: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    tanggal: '',
    status: '',
    kelas: '',
    mataPelajaran: '',
    guru: '',
    search: '',
  },
  isLoading: false,
  error: null,
  successMessage: null,
};

const absenSlice = createSlice({
  name: 'absen',
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
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1;
    },
    clearCurrentAbsen: (state) => {
      state.currentAbsen = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch absen
      .addCase(fetchAbsen.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAbsen.fulfilled, (state, action) => {
        state.isLoading = false;
        state.absen = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchAbsen.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch absen by ID
      .addCase(fetchAbsenById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAbsenById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAbsen = action.payload;
      })
      .addCase(fetchAbsenById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create absen
      .addCase(createAbsen.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAbsen.fulfilled, (state, action) => {
        state.isLoading = false;
        state.absen.unshift(action.payload);
        state.successMessage = 'Absensi berhasil ditambahkan';
        state.pagination.total += 1;
      })
      .addCase(createAbsen.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update absen
      .addCase(updateAbsen.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAbsen.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.absen.findIndex(absen => absen._id === action.payload._id);
        if (index !== -1) {
          state.absen[index] = action.payload;
        }
        if (state.currentAbsen && state.currentAbsen._id === action.payload._id) {
          state.currentAbsen = action.payload;
        }
        state.successMessage = 'Data absensi berhasil diupdate';
      })
      .addCase(updateAbsen.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete absen
      .addCase(deleteAbsen.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAbsen.fulfilled, (state, action) => {
        state.isLoading = false;
        state.absen = state.absen.filter(absen => absen._id !== action.payload);
        if (state.currentAbsen && state.currentAbsen._id === action.payload) {
          state.currentAbsen = null;
        }
        state.successMessage = 'Absensi berhasil dihapus';
        state.pagination.total -= 1;
      })
      .addCase(deleteAbsen.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create bulk absen
      .addCase(createBulkAbsen.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBulkAbsen.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = `Berhasil membuat ${action.payload.length} absensi`;
        // Refresh the list
        state.pagination.page = 1;
      })
      .addCase(createBulkAbsen.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchAbsenStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAbsenStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAbsenStats.rejected, (state, action) => {
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
  clearCurrentAbsen,
} = absenSlice.actions;

export default absenSlice.reducer;