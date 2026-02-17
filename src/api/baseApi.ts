// src/features/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logoutUser } from '../store/slices/userSlice';
import { RootState } from '../store/store';
import { BASE_URL, LOYALTY_BASE_URL } from '../theme';

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    headers.set('Content-Type', 'application/json');
    headers.set('Accept-Language', 'en');
    const state = getState() as RootState;
    const token = state.user.token;
    // const token = realmInstance
    //   .objects('User')
    //   .filtered('TRUEPREDICATE LIMIT(1)')[0]?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQueryWithAuth(args, api, extraOptions);

    // console.log('args:', api);
    // console.log('API Response:', result);
    // console.log('Call Body:', args.body);
    // console.log('API Headers:', result.meta?.request.headers);
    // console.log('Error Object:', result.error);
    // console.log('Error Status:', result.error?.status);
    if (result.error?.status === 401) {
      api.dispatch(logoutUser());
    }

    // Automatically unwrap the 'data' field if the response is wrapped
    // if (result.data && typeof result.data === 'object' && 'data' in result.data) {
    //   return { ...result, data: (result.data as { data: unknown }).data };
    // }

    return result;
  },
  tagTypes: [
    'addresses',
    'profile',
    'allergens',
    'Order',
    'orderStatus',
    'homepage',
    'offers',
    'favorites',
    'categories',
    'items',
    'checkout',
    'cart',
    'legals',
  ],
  endpoints: () => ({}),
});

// Loyalty Program Base API
const loyaltyBaseQueryWithAuth = fetchBaseQuery({
  baseUrl: LOYALTY_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    headers.set('Content-Type', 'application/json');
    headers.set('Accept-Language', 'en');
    const state = getState() as RootState;
    const token = state.user.jwt;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const loyaltyBaseApi = createApi({
  reducerPath: 'loyaltyApi',
  baseQuery: async (args, api, extraOptions) => {
    const result = await loyaltyBaseQueryWithAuth(args, api, extraOptions);

    console.log('Loyalty API Response:', result);
    console.log('Loyalty API Headers Sent:', Object.fromEntries(result.meta?.request?.headers?.entries() ?? []));
    if (result.error?.status === 401) {
      api.dispatch(logoutUser());
    }

    return result;
  },
  tagTypes: ['loyalty', 'tiers', 'points', 'rewards'],
  endpoints: () => ({}),
});
