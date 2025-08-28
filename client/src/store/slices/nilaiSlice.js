import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { nilaiAPI } from '../../services/api';

// Async thunks
export const fetchNilai = createAsyncThunk(
  'nilai/fetchNilai',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await nilaiAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data nilai');
    }
  }
);

export const fetchNilaiById = createAsyncThunk(
  'nilai/fetchNilaiById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await nilaiAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data nilai');
    }
  }
);

export const createNilai = createAsyncThunk(
  'nilai/createNilai',
  async (nilaiData, { rejectWithValue }) => {
    try {
      const response = await nilaiAPI.create(nilaiData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat nilai baru');
    }
  }
);

export const updateNilai = createAsyncThunk(
  'nilai/updateNilai',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await nilaiAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengupdate data nilai');
    }
  }
);

export const deleteNilai = createAsyncThunk(
  'nilai/deleteNilai',
  async (id, { rejectWithValue }) => {
    try {
      await nilaiAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menghapus nilai');
    }
  }
);

export const fetchNilaiBySiswa = createAsyncThunk(
  'nilai/fetchNilaiBySiswa',
  async (siswaId, { rejectWithValue }) => {
    try {
      const response = await nilaiAPI.getBySiswa(siswaId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil nilai siswa');
    }
  }
);

export const fetchNilaiByMapel = createAsyncThunk(
  'nilai/fetchNilaiByMapel',
  async (mataPelajaran, { rejectWithValue }) => {
    try {
      const response = await nilaiAPI.getByMapel(mataPelajaran);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil nilai berdasarkan mata pelajaran');
    }
  }
);

export const fetchRaporSiswa = createAsyncThunk(
  'nilai/fetchRaporSiswa',
  async (siswaId, { rejectWithValue }) => {
    try {
      const response = await nilaiAPI.getRapor(siswaId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil rapor siswa');
    }
  }
);

export const fetchNilaiStats = createAsyncThunk(
  'nilai/fetchNilaiStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await nilaiAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil statistik nilai');
    }
  }
);

const initialState = {
  nilai: [],
  currentNilai: null,
  nilaiBySiswa: [],
  nilaiByMapel: [],
  raporSiswa: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    siswa: '',
    mataPelajaran: '',
    kelas: '',
    semester: '',
    tahunAjaran: '',
    guru: '',
    search: '',
  },
  isLoading: false,
  error: null,
  successMessage: null,
};

const nilaiSlice = createSlice({
  name: 'nilai',
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
    clearCurrentNilai: (state) => {
      state.currentNilai = null;
    },
    clearNilaiBySiswa: (state) => {
      state.nilaiBySiswa = [];
    },
    clearNilaiByMapel: (state) => {
      state.nilaiByMapel = [];
    },
    clearRaporSiswa: (state) => {
      state.raporSiswa = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch nilai
      .addCase(fetchNilai.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNilai.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nilai = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchNilai.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch nilai by ID
      .addCase(fetchNilaiById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNilaiById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentNilai = action.payload;
      })
      .addCase(fetchNilaiById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create nilai
      .addCase(createNilai.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNilai.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nilai.unshift(action.payload);
        state.successMessage = 'Nilai berhasil ditambahkan';
        state.pagination.total += 1;
      })
      .addCase(createNilai.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update nilai
      .addCase(updateNilai.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNilai.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.nilai.findIndex(nilai => nilai._id === action.payload._id);
        if (index !== -1) {
          state.nilai[index] = action.payload;
        }
        if (state.currentNilai && state.currentNilai._id === action.payload._id) {
          state.currentNilai = action.payload;
        }
        state.successMessage = 'Data nilai berhasil diupdate';
      })
      .addCase(updateNilai.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete nilai
      .addCase(deleteNilai.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNilai.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nilai = state.nilai.filter(nilai => nilai._id !== action.payload);
        if (state.currentNilai && state.currentNilai._id === action.payload) {
          state.currentNilai = null;
        }
        state.successMessage = 'Nilai berhasil dihapus';
        state.pagination.total -= 1;
      })
      .addCase(deleteNilai.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch nilai by siswa
      .addCase(fetchNilaiBySiswa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNilaiBySiswa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nilaiBySiswa = action.payload;
      })
      .addCase(fetchNilaiBySiswa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch nilai by mapel
      .addCase(fetchNilaiByMapel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNilaiByMapel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nilaiByMapel = action.payload;
      })
      .addCase(fetchNilaiByMapel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch rapor siswa
      .addCase(fetchRaporSiswa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRaporSiswa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.raporSiswa = action.payload;
      })
      .addCase(fetchRaporSiswa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchNilaiStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNilaiStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchNilaiStats.rejected, (state, action) => {
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
  clearCurrentNilai,
  clearNilaiBySiswa,
  clearNilaiByMapel,
  clearRaporSiswa,
} = nilaiSlice.actions;

export default nilaiSlice.reducer;