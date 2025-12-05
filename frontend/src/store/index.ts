import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// API imports
import { baseApi } from './api/baseApi';
// Import to ensure endpoints are injected
import './api/articleApi';
import './api/assignmentApi';
import './api/authApi';
import './api/categoryApi';
import './api/certificateApi';
import './api/courseApi';
import './api/enrollmentApi';
import './api/messageApi';
import './api/organizationApi';
import './api/paymentApi';
import './api/questionApi';
import './api/questionBankApi';
import './api/quizApi';
import './api/settingApi';
import './api/uploadApi';
import './api/userApi';

// Slice imports
import authReducer from './slices/authSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
  blacklist: ['api'], // Don't persist API cache
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['register'],
      },
    }).concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks
export { useAppDispatch, useAppSelector } from './hooks';