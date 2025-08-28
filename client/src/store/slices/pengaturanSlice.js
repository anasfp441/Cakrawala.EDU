import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pengaturanAPI } from '../../services/api';

// Async thunks
export const fetchPengaturan = createAsyncThunk(
  'pengaturan/fetchPengaturan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil pengaturan sistem');
    }
  }
);

export const updatePengaturan = createAsyncThunk(
  'pengaturan/updatePengaturan',
  async (pengaturanData, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.updateAll(pengaturanData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengupdate pengaturan sistem');
    }
  }
);

export const resetPengaturan = createAsyncThunk(
  'pengaturan/resetPengaturan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.reset();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal reset pengaturan sistem');
    }
  }
);

export const fetchPengaturanByKey = createAsyncThunk(
  'pengaturan/fetchPengaturanByKey',
  async (key, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.getByKey(key);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil pengaturan');
    }
  }
);

export const updatePengaturanByKey = createAsyncThunk(
  'pengaturan/updatePengaturanByKey',
  async ({ key, value }, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.updateByKey(key, value);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengupdate pengaturan');
    }
  }
);

export const fetchPublicConfig = createAsyncThunk(
  'pengaturan/fetchPublicConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.getPublicConfig();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil konfigurasi publik');
    }
  }
);

export const fetchAcademicConfig = createAsyncThunk(
  'pengaturan/fetchAcademicConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.getAcademicConfig();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil konfigurasi akademik');
    }
  }
);

export const fetchNotificationConfig = createAsyncThunk(
  'pengaturan/fetchNotificationConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.getNotificationConfig();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil konfigurasi notifikasi');
    }
  }
);

export const fetchDisplayConfig = createAsyncThunk(
  'pengaturan/fetchDisplayConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.getDisplayConfig();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil konfigurasi tampilan');
    }
  }
);

export const exportPengaturan = createAsyncThunk(
  'pengaturan/exportPengaturan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.export();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal export pengaturan');
    }
  }
);

export const importPengaturan = createAsyncThunk(
  'pengaturan/importPengaturan',
  async (importData, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.import(importData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal import pengaturan');
    }
  }
);

export const backupPengaturan = createAsyncThunk(
  'pengaturan/backupPengaturan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.backup();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal backup pengaturan');
    }
  }
);

export const restorePengaturan = createAsyncThunk(
  'pengaturan/restorePengaturan',
  async (backupData, { rejectWithValue }) => {
    try {
      const response = await pengaturanAPI.restore(backupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal restore pengaturan');
    }
  }
);

const initialState = {
  pengaturan: {},
  currentPengaturan: null,
  publicConfig: {},
  academicConfig: {},
  notificationConfig: {},
  displayConfig: {},
  isLoading: false,
  error: null,
  successMessage: null,
};

const pengaturanSlice = createSlice({
  name: 'pengaturan',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearCurrentPengaturan: (state) => {
      state.currentPengaturan = null;
    },
    clearPublicConfig: (state) => {
      state.publicConfig = {};
    },
    clearAcademicConfig: (state) => {
      state.academicConfig = {};
    },
    clearNotificationConfig: (state) => {
      state.notificationConfig = {};
    },
    clearDisplayConfig: (state) => {
      state.displayConfig = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pengaturan
      .addCase(fetchPengaturan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPengaturan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pengaturan = action.payload;
      })
      .addCase(fetchPengaturan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update pengaturan
      .addCase(updatePengaturan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePengaturan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pengaturan = action.payload;
        state.successMessage = 'Pengaturan sistem berhasil diupdate';
      })
      .addCase(updatePengaturan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset pengaturan
      .addCase(resetPengaturan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPengaturan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pengaturan = action.payload;
        state.successMessage = 'Pengaturan sistem berhasil direset';
      })
      .addCase(resetPengaturan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch pengaturan by key
      .addCase(fetchPengaturanByKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPengaturanByKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPengaturan = action.payload;
      })
      .addCase(fetchPengaturanByKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update pengaturan by key
      .addCase(updatePengaturanByKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePengaturanByKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pengaturan = { ...state.pengaturan, ...action.payload };
        state.successMessage = 'Pengaturan berhasil diupdate';
      })
      .addCase(updatePengaturanByKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch public config
      .addCase(fetchPublicConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publicConfig = action.payload;
      })
      .addCase(fetchPublicConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch academic config
      .addCase(fetchAcademicConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAcademicConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.academicConfig = action.payload;
      })
      .addCase(fetchAcademicConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch notification config
      .addCase(fetchNotificationConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notificationConfig = action.payload;
      })
      .addCase(fetchNotificationConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch display config
      .addCase(fetchDisplayConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDisplayConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.displayConfig = action.payload;
      })
      .addCase(fetchDisplayConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Export pengaturan
      .addCase(exportPengaturan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportPengaturan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Pengaturan berhasil diexport';
      })
      .addCase(exportPengaturan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Import pengaturan
      .addCase(importPengaturan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(importPengaturan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pengaturan = action.payload;
        state.successMessage = 'Pengaturan berhasil diimport';
      })
      .addCase(importPengaturan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Backup pengaturan
      .addCase(backupPengaturan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(backupPengaturan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Pengaturan berhasil dibackup';
      })
      .addCase(backupPengaturan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Restore pengaturan
      .addCase(restorePengaturan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restorePengaturan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pengaturan = action.payload;
        state.successMessage = 'Pengaturan berhasil direstore';
      })
      .addCase(restorePengaturan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccessMessage,
  clearCurrentPengaturan,
  clearPublicConfig,
  clearAcademicConfig,
  clearNotificationConfig,
  clearDisplayConfig,
} = pengaturanSlice.actions;

export default pengaturanSlice.reducer;