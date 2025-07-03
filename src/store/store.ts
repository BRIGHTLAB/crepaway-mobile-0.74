import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import notificationsReducer from './slices/notificationsSlice';
import { baseApi } from '../api/baseApi';
import cartMiddleware from './middleware/cartMiddleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';
import persistStore from 'redux-persist/es/persistStore';
import { s3BaseApi } from '../api/s3UploaderApi';



const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
};

const cartPersistConfig = {
  key: 'cart',
  storage: AsyncStorage,
  whitelist: ['orderType', 'branchName'],
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);


const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [s3BaseApi.reducerPath]: s3BaseApi.reducer,
    user: persistedUserReducer,
    cart: persistedCartReducer,
    notifications: notificationsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(baseApi.middleware, cartMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export type AppDispatch = typeof store.dispatch;

export default store;
