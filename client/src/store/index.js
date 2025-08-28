import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import siswaReducer from './slices/siswaSlice';
import absenReducer from './slices/absenSlice';
import jadwalReducer from './slices/jadwalSlice';
import materiReducer from './slices/materiSlice';
import tugasReducer from './slices/tugasSlice';
import ujianReducer from './slices/ujianSlice';
import nilaiReducer from './slices/nilaiSlice';
import pengaturanReducer from './slices/pengaturanSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    siswa: siswaReducer,
    absen: absenReducer,
    jadwal: jadwalReducer,
    materi: materiReducer,
    tugas: tugasReducer,
    ujian: ujianReducer,
    nilai: nilaiReducer,
    pengaturan: pengaturanReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;