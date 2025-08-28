import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tugasAPI } from '../../services/api';

// Async thunks
export const fetchTugas = createAsyncThunk(
  'tugas/fetchTugas',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tugasAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data tugas');
    }
  }
);

export const fetchTugasById = createAsyncThunk(
  'tugas/fetchTugasById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tugasAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data tugas');
    }
  }
);

export const createTugas = createAsyncThunk(
  'tugas/createTugas',
  async (tugasData, { rejectWithValue }) => {
    try {
      const response = await tugasAPI.create(tugasData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat tugas baru');
    }
  }
);

export const updateTugas = createAsyncThunk(
  'tugas/updateTugas',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await tugasAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengupdate data tugas');
    }
  }
);

export const deleteTugas = createAsyncThunk(
  'tugas/deleteTugas',
  async (id, { rejectWithValue }) => {
    try {
      await tugasAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menghapus tugas');
    }
  }
);

export const updateTugasStatus = createAsyncThunk(
  'tugas/updateTugasStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await tugasAPI.updateStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengubah status tugas');
    }
  }
);

export const toggleTugasStatus = createAsyncThunk(
  'tugas/toggleTugasStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tugasAPI.toggleStatus(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengubah status tugas');
    }
  }
);

export const fetchTugasByMapel = createAsyncThunk(
  'tugas/fetchTugasByMapel',
  async (mataPelajaran, { rejectWithValue }) => {
    try {
      const response = await tugasAPI.getByMapel(mataPelajaran);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil tugas berdasarkan mata pelajaran');
    }
  }
);

export const fetchOverdueTugas = createAsyncThunk(
  'tugas/fetchOverdueTugas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tugasAPI.getOverdue();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil tugas yang terlambat');
    }
  }
);

export const fetchTodayTugas = createAsyncThunk(
  'tugas/fetchTodayTugas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tugasAPI.getToday();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil tugas hari ini');
    }
  }
);

export const fetchTugasStats = createAsyncThunk(
  'tugas/fetchTugasStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tugasAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil statistik tugas');
    }
  }
);

const initialState = {
  tugas: [],
  currentTugas: null,
  tugasByMapel: [],
  overdueTugas: [],
  todayTugas: [],
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    mataPelajaran: '',
    kelas: '',
    jurusan: '',
    semester: '',
    tahunAjaran: '',
    status: '',
    isActive: '',
    search: '',
  },
  isLoading: false,
  error: null,
  successMessage: null,
};

const tugasSlice = createSlice({
  name: 'tugas',
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
    clearCurrentTugas: (state) => {
      state.currentTugas = null;
    },
    clearTugasByMapel: (state) => {
      state.tugasByMapel = [];
    },
    clearOverdueTugas: (state) => {
      state.overdueTugas = [];
    },
    clearTodayTugas: (state) => {
      state.todayTugas = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tugas
      .addCase(fetchTugas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTugas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tugas = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchTugas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch tugas by ID
      .addCase(fetchTugasById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTugasById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTugas = action.payload;
      })
      .addCase(fetchTugasById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create tugas
      .addCase(createTugas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTugas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tugas.unshift(action.payload);
        state.successMessage = 'Tugas berhasil ditambahkan';
        state.pagination.total += 1;
      })
      .addCase(createTugas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update tugas
      .addCase(updateTugas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTugas.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tugas.findIndex(tugas => tugas._id === action.payload._id);
        if (index !== -1) {
          state.tugas[index] = action.payload;
        }
        if (state.currentTugas && state.currentTugas._id === action.payload._id) {
          state.currentTugas = action.payload;
        }
        state.successMessage = 'Data tugas berhasil diupdate';
      })
      .addCase(updateTugas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete tugas
      .addCase(deleteTugas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTugas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tugas = state.tugas.filter(tugas => tugas._id !== action.payload);
        if (state.currentTugas && state.currentTugas._id === action.payload) {
          state.currentTugas = null;
        }
        state.successMessage = 'Tugas berhasil dihapus';
        state.pagination.total -= 1;
      })
      .addCase(deleteTugas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update tugas status
      .addCase(updateTugasStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTugasStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tugas.findIndex(tugas => tugas._id === action.payload._id);
        if (index !== -1) {
          state.tugas[index] = action.payload;
        }
        if (state.currentTugas && state.currentTugas._id === action.payload._id) {
          state.currentTugas = action.payload;
        }
        state.successMessage = 'Status tugas berhasil diubah';
      })
      .addCase(updateTugasStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Toggle tugas status
      .addCase(toggleTugasStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleTugasStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tugas.findIndex(tugas => tugas._id === action.payload._id);
        if (index !== -1) {
          state.tugas[index] = action.payload;
        }
        if (state.currentTugas && state.currentTugas._id === action.payload._id) {
          state.currentTugas = action.payload;
        }
        state.successMessage = 'Status tugas berhasil diubah';
      })
      .addCase(toggleTugasStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch tugas by mapel
      .addCase(fetchTugasByMapel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTugasByMapel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tugasByMapel = action.payload;
      })
      .addCase(fetchTugasByMapel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch overdue tugas
      .addCase(fetchOverdueTugas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOverdueTugas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overdueTugas = action.payload;
      })
      .addCase(fetchOverdueTugas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch today tugas
      .addCase(fetchTodayTugas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayTugas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayTugas = action.payload;
      })
      .addCase(fetchTodayTugas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchTugasStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTugasStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTugasStats.rejected, (state, action) => {
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
  clearCurrentTugas,
  clearTugasByMapel,
  clearOverdueTugas,
  clearTodayTugas,
} = tugasSlice.actions;

export default tugasSlice.reducer;