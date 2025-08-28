import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { materiAPI } from '../../services/api';

// Async thunks
export const fetchMateri = createAsyncThunk(
  'materi/fetchMateri',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await materiAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data materi');
    }
  }
);

export const fetchMateriById = createAsyncThunk(
  'materi/fetchMateriById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await materiAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data materi');
    }
  }
);

export const createMateri = createAsyncThunk(
  'materi/createMateri',
  async (materiData, { rejectWithValue }) => {
    try {
      const response = await materiAPI.create(materiData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat materi baru');
    }
  }
);

export const updateMateri = createAsyncThunk(
  'materi/updateMateri',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await materiAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengupdate data materi');
    }
  }
);

export const deleteMateri = createAsyncThunk(
  'materi/deleteMateri',
  async (id, { rejectWithValue }) => {
    try {
      await materiAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menghapus materi');
    }
  }
);

export const toggleMateriPublish = createAsyncThunk(
  'materi/toggleMateriPublish',
  async (id, { rejectWithValue }) => {
    try {
      const response = await materiAPI.togglePublish(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengubah status publish materi');
    }
  }
);

export const downloadMateri = createAsyncThunk(
  'materi/downloadMateri',
  async (id, { rejectWithValue }) => {
    try {
      const response = await materiAPI.download(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mendownload materi');
    }
  }
);

export const searchMateri = createAsyncThunk(
  'materi/searchMateri',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await materiAPI.searchAdvanced(searchParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mencari materi');
    }
  }
);

export const fetchMateriByMapel = createAsyncThunk(
  'materi/fetchMateriByMapel',
  async (mataPelajaran, { rejectWithValue }) => {
    try {
      const response = await materiAPI.getByMapel(mataPelajaran);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil materi berdasarkan mata pelajaran');
    }
  }
);

export const fetchMateriStats = createAsyncThunk(
  'materi/fetchMateriStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await materiAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil statistik materi');
    }
  }
);

const initialState = {
  materi: [],
  currentMateri: null,
  searchResults: [],
  materiByMapel: [],
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
    isPublished: '',
    search: '',
  },
  isLoading: false,
  error: null,
  successMessage: null,
};

const materiSlice = createSlice({
  name: 'materi',
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
    clearCurrentMateri: (state) => {
      state.currentMateri = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearMateriByMapel: (state) => {
      state.materiByMapel = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch materi
      .addCase(fetchMateri.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMateri.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materi = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchMateri.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch materi by ID
      .addCase(fetchMateriById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMateriById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMateri = action.payload;
      })
      .addCase(fetchMateriById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create materi
      .addCase(createMateri.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMateri.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materi.unshift(action.payload);
        state.successMessage = 'Materi berhasil ditambahkan';
        state.pagination.total += 1;
      })
      .addCase(createMateri.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update materi
      .addCase(updateMateri.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMateri.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.materi.findIndex(materi => materi._id === action.payload._id);
        if (index !== -1) {
          state.materi[index] = action.payload;
        }
        if (state.currentMateri && state.currentMateri._id === action.payload._id) {
          state.currentMateri = action.payload;
        }
        state.successMessage = 'Data materi berhasil diupdate';
      })
      .addCase(updateMateri.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete materi
      .addCase(deleteMateri.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMateri.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materi = state.materi.filter(materi => materi._id !== action.payload);
        if (state.currentMateri && state.currentMateri._id === action.payload) {
          state.currentMateri = null;
        }
        state.successMessage = 'Materi berhasil dihapus';
        state.pagination.total -= 1;
      })
      .addCase(deleteMateri.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Toggle publish status
      .addCase(toggleMateriPublish.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleMateriPublish.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.materi.findIndex(materi => materi._id === action.payload._id);
        if (index !== -1) {
          state.materi[index] = action.payload;
        }
        if (state.currentMateri && state.currentMateri._id === action.payload._id) {
          state.currentMateri = action.payload;
        }
        state.successMessage = 'Status publish materi berhasil diubah';
      })
      .addCase(toggleMateriPublish.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Download materi
      .addCase(downloadMateri.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(downloadMateri.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update download count in the list
        const index = state.materi.findIndex(materi => materi._id === action.payload._id);
        if (index !== -1) {
          state.materi[index].downloads = action.payload.downloads;
        }
        if (state.currentMateri && state.currentMateri._id === action.payload._id) {
          state.currentMateri.downloads = action.payload.downloads;
        }
        state.successMessage = 'Materi berhasil didownload';
      })
      .addCase(downloadMateri.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search materi
      .addCase(searchMateri.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMateri.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchMateri.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch materi by mapel
      .addCase(fetchMateriByMapel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMateriByMapel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materiByMapel = action.payload;
      })
      .addCase(fetchMateriByMapel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchMateriStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMateriStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchMateriStats.rejected, (state, action) => {
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
  clearCurrentMateri,
  clearSearchResults,
  clearMateriByMapel,
} = materiSlice.actions;

export default materiSlice.reducer;