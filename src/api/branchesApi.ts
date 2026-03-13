import { baseApi } from './baseApi';

type DineInConfig = {
  dinein_enabled: boolean;
  dinein_socket_url: string | null;
};

export const ordersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getMenuBranches: builder.query<Branch[], OrderType['menu_type'] | void>({
      query: menu_type => `/branches?menu_type=${menu_type}&limit=999`,
    }),
    getDineInConfig: builder.query<DineInConfig, string>({
      query: (alias) => `/branches/${alias}/dinein-config`,
    }),
  }),

  overrideExisting: true,
});

export const { useGetMenuBranchesQuery, useLazyGetDineInConfigQuery } = ordersApi;
