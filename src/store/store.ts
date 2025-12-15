import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { persistReducer } from 'redux-persist';
import persistStore from 'redux-persist/es/persistStore';
import { baseApi, loyaltyBaseApi } from '../api/baseApi';
import { s3BaseApi } from '../api/s3UploaderApi';
import cartMiddleware from './middleware/cartMiddleware';
import cartReducer from './slices/cartSlice';
import dineInReducer from './slices/dineInSlice';
import notificationsReducer from './slices/notificationsSlice';
import userReducer from './slices/userSlice';



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
    [loyaltyBaseApi.reducerPath]: loyaltyBaseApi.reducer,
    [s3BaseApi.reducerPath]: s3BaseApi.reducer,
    user: persistedUserReducer,
    cart: persistedCartReducer,
    notifications: notificationsReducer,
    dineIn: dineInReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(baseApi.middleware, loyaltyBaseApi.middleware, cartMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export type AppDispatch = typeof store.dispatch;

export default store;
