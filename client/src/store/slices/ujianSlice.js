import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ujianAPI } from '../../services/api';

// Async thunks
export const fetchUjian = createAsyncThunk(
  'ujian/fetchUjian',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ujianAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data ujian');
    }
  }
);

export const fetchUjianById = createAsyncThunk(
  'ujian/fetchUjianById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ujianAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data ujian');
    }
  }
);

export const createUjian = createAsyncThunk(
  'ujian/createUjian',
  async (ujianData, { rejectWithValue }) => {
    try {
      const response = await ujianAPI.create(ujianData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat ujian baru');
    }
  }
);

export const updateUjian = createAsyncThunk(
  'ujian/updateUjian',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await ujianAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengupdate data ujian');
    }
  }
);

export const deleteUjian = createAsyncThunk(
  'ujian/deleteUjian',
  async (id, { rejectWithValue }) => {
    try {
      await ujianAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menghapus ujian');
    }
  }
);

export const updateUjianStatus = createAsyncThunk(
  'ujian/updateUjianStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await ujianAPI.updateStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengubah status ujian');
    }
  }
);

export const startUjian = createAsyncThunk(
  'ujian/startUjian',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ujianAPI.start(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal memulai ujian');
    }
  }
);

export const submitUjian = createAsyncThunk(
  'ujian/submitUjian',
  async ({ id, answers }, { rejectWithValue }) => {
    try {
      const response = await ujianAPI.submit(id, answers);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengirim jawaban ujian');
    }
  }
);

export const getUjianResult = createAsyncThunk(
  'ujian/getUjianResult',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ujianAPI.getResult(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil hasil ujian');
    }
  }
);

export const getUjianParticipants = createAsyncThunk(
  'ujian/getUjianParticipants',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ujianAPI.getParticipants(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil daftar peserta ujian');
    }
  }
);

export const exportUjianResult = createAsyncThunk(
  'ujian/exportUjianResult',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ujianAPI.exportResult(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal export hasil ujian');
    }
  }
);

export const fetchUjianStats = createAsyncThunk(
  'ujian/fetchUjianStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ujianAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil statistik ujian');
    }
  }
);

const initialState = {
  ujian: [],
  currentUjian: null,
  activeUjian: null,
  ujianResult: null,
  participants: [],
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
    search: '',
  },
  isLoading: false,
  error: null,
  successMessage: null,
  examTimer: null,
  examStartTime: null,
};

const ujianSlice = createSlice({
  name: 'ujian',
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
    clearCurrentUjian: (state) => {
      state.currentUjian = null;
    },
    clearActiveUjian: (state) => {
      state.activeUjian = null;
      state.examTimer = null;
      state.examStartTime = null;
    },
    clearUjianResult: (state) => {
      state.ujianResult = null;
    },
    clearParticipants: (state) => {
      state.participants = [];
    },
    setExamTimer: (state, action) => {
      state.examTimer = action.payload;
    },
    setExamStartTime: (state, action) => {
      state.examStartTime = action.payload;
    },
    updateExamTimer: (state, action) => {
      state.examTimer = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch ujian
      .addCase(fetchUjian.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUjian.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ujian = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchUjian.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch ujian by ID
      .addCase(fetchUjianById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUjianById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUjian = action.payload;
      })
      .addCase(fetchUjianById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create ujian
      .addCase(createUjian.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUjian.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ujian.unshift(action.payload);
        state.successMessage = 'Ujian berhasil dibuat';
        state.pagination.total += 1;
      })
      .addCase(createUjian.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update ujian
      .addCase(updateUjian.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUjian.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.ujian.findIndex(ujian => ujian._id === action.payload._id);
        if (index !== -1) {
          state.ujian[index] = action.payload;
        }
        if (state.currentUjian && state.currentUjian._id === action.payload._id) {
          state.currentUjian = action.payload;
        }
        state.successMessage = 'Data ujian berhasil diupdate';
      })
      .addCase(updateUjian.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete ujian
      .addCase(deleteUjian.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUjian.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ujian = state.ujian.filter(ujian => ujian._id !== action.payload);
        if (state.currentUjian && state.currentUjian._id === action.payload) {
          state.currentUjian = null;
        }
        state.successMessage = 'Ujian berhasil dihapus';
        state.pagination.total -= 1;
      })
      .addCase(deleteUjian.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update ujian status
      .addCase(updateUjianStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUjianStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.ujian.findIndex(ujian => ujian._id === action.payload._id);
        if (index !== -1) {
          state.ujian[index] = action.payload;
        }
        if (state.currentUjian && state.currentUjian._id === action.payload._id) {
          state.currentUjian = action.payload;
        }
        state.successMessage = 'Status ujian berhasil diubah';
      })
      .addCase(updateUjianStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Start ujian
      .addCase(startUjian.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startUjian.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeUjian = action.payload;
        state.examStartTime = new Date().toISOString();
        state.successMessage = 'Ujian berhasil dimulai';
      })
      .addCase(startUjian.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Submit ujian
      .addCase(submitUjian.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitUjian.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ujianResult = action.payload;
        state.successMessage = 'Jawaban ujian berhasil dikirim';
      })
      .addCase(submitUjian.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get ujian result
      .addCase(getUjianResult.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUjianResult.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ujianResult = action.payload;
      })
      .addCase(getUjianResult.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get participants
      .addCase(getUjianParticipants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUjianParticipants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.participants = action.payload;
      })
      .addCase(getUjianParticipants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Export result
      .addCase(exportUjianResult.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportUjianResult.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Hasil ujian berhasil diexport';
      })
      .addCase(exportUjianResult.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchUjianStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUjianStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUjianStats.rejected, (state, action) => {
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
  clearCurrentUjian,
  clearActiveUjian,
  clearUjianResult,
  clearParticipants,
  setExamTimer,
  setExamStartTime,
  updateExamTimer,
} = ujianSlice.actions;

export default ujianSlice.reducer;