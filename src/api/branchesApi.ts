import { baseApi } from './baseApi';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getMenuBranches: builder.query<Branch[], OrderType['menu_type'] | void>({
      query: menu_type => `/branches?menu_type=${menu_type}&limit=999`,
    }),
  }),

  overrideExisting: true,
});

export const { useGetMenuBranchesQuery } = ordersApi;
