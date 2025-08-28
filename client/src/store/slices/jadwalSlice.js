import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jadwalAPI } from '../../services/api';

// Async thunks
export const fetchJadwal = createAsyncThunk(
  'jadwal/fetchJadwal',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await jadwalAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data jadwal');
    }
  }
);

export const fetchJadwalById = createAsyncThunk(
  'jadwal/fetchJadwalById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await jadwalAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data jadwal');
    }
  }
);

export const createJadwal = createAsyncThunk(
  'jadwal/createJadwal',
  async (jadwalData, { rejectWithValue }) => {
    try {
      const response = await jadwalAPI.create(jadwalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat jadwal baru');
    }
  }
);

export const updateJadwal = createAsyncThunk(
  'jadwal/updateJadwal',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await jadwalAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengupdate data jadwal');
    }
  }
);

export const deleteJadwal = createAsyncThunk(
  'jadwal/deleteJadwal',
  async (id, { rejectWithValue }) => {
    try {
      await jadwalAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menghapus jadwal');
    }
  }
);

export const toggleJadwalStatus = createAsyncThunk(
  'jadwal/toggleJadwalStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await jadwalAPI.toggleStatus(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengubah status jadwal');
    }
  }
);

export const fetchTodayJadwal = createAsyncThunk(
  'jadwal/fetchTodayJadwal',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jadwalAPI.getTodayCurrent();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil jadwal hari ini');
    }
  }
);

export const fetchWeeklyJadwal = createAsyncThunk(
  'jadwal/fetchWeeklyJadwal',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await jadwalAPI.getWeekly(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil jadwal mingguan');
    }
  }
);

export const fetchJadwalStats = createAsyncThunk(
  'jadwal/fetchJadwalStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jadwalAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil statistik jadwal');
    }
  }
);

const initialState = {
  jadwal: [],
  currentJadwal: null,
  todayJadwal: [],
  weeklyJadwal: [],
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    hari: '',
    kelas: '',
    jurusan: '',
    mataPelajaran: '',
    guru: '',
    isActive: '',
    search: '',
  },
  isLoading: false,
  error: null,
  successMessage: null,
};

const jadwalSlice = createSlice({
  name: 'jadwal',
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
    clearCurrentJadwal: (state) => {
      state.currentJadwal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jadwal
      .addCase(fetchJadwal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJadwal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jadwal = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchJadwal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch jadwal by ID
      .addCase(fetchJadwalById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJadwalById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentJadwal = action.payload;
      })
      .addCase(fetchJadwalById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create jadwal
      .addCase(createJadwal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJadwal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jadwal.unshift(action.payload);
        state.successMessage = 'Jadwal berhasil ditambahkan';
        state.pagination.total += 1;
      })
      .addCase(createJadwal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update jadwal
      .addCase(updateJadwal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateJadwal.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.jadwal.findIndex(jadwal => jadwal._id === action.payload._id);
        if (index !== -1) {
          state.jadwal[index] = action.payload;
        }
        if (state.currentJadwal && state.currentJadwal._id === action.payload._id) {
          state.currentJadwal = action.payload;
        }
        state.successMessage = 'Data jadwal berhasil diupdate';
      })
      .addCase(updateJadwal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete jadwal
      .addCase(deleteJadwal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteJadwal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jadwal = state.jadwal.filter(jadwal => jadwal._id !== action.payload);
        if (state.currentJadwal && state.currentJadwal._id === action.payload) {
          state.currentJadwal = null;
        }
        state.successMessage = 'Jadwal berhasil dihapus';
        state.pagination.total -= 1;
      })
      .addCase(deleteJadwal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Toggle jadwal status
      .addCase(toggleJadwalStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleJadwalStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.jadwal.findIndex(jadwal => jadwal._id === action.payload._id);
        if (index !== -1) {
          state.jadwal[index] = action.payload;
        }
        if (state.currentJadwal && state.currentJadwal._id === action.payload._id) {
          state.currentJadwal = action.payload;
        }
        state.successMessage = 'Status jadwal berhasil diubah';
      })
      .addCase(toggleJadwalStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch today jadwal
      .addCase(fetchTodayJadwal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayJadwal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayJadwal = action.payload;
      })
      .addCase(fetchTodayJadwal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch weekly jadwal
      .addCase(fetchWeeklyJadwal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyJadwal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.weeklyJadwal = action.payload;
      })
      .addCase(fetchWeeklyJadwal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchJadwalStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJadwalStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchJadwalStats.rejected, (state, action) => {
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
  clearCurrentJadwal,
} = jadwalSlice.actions;

export default jadwalSlice.reducer;