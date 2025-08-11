// src/features/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';
import { BASE_URL } from '../theme';

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
    console.log('API Response:', result);
    // console.log('Call Body:', args.body);
    // console.log('API Headers:', result.meta?.request.headers);
    // console.log('Error Object:', result.error);
    // console.log('Error Status:', result.error?.status);
    if (result.error?.status === 401) {
      // api.dispatch(logoutUser());
      //   const user = realmInstance
      //     .objects('User')
      //     .filtered('TRUEPREDICATE LIMIT(1)')[0];
      //   if (user) {
      //     // await realmInstance.write(() => {
      //     //   realmInstance.delete(realmInstance.objects('User'));
      //     // });
      //     await realmInstance.write(() => {
      //       user.token = null;
      //       console.log('writing to realm userToken is null12e3413');
      //     });
      //   }
    }

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
  ],
  endpoints: () => ({}),
});
