import { baseApi } from './baseApi';

export const offersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getOffers: builder.query<Offer[], { menu?: string; menuType?: OrderType['menu_type']; branch: string }>({
      query: ({ menu, branch, menuType }) => {
        const params = new URLSearchParams();
        if (menu) params.append('menu', menu);
        if (menuType) params.append('menu_type', menuType);
        params.append('branch', branch);
        return `/exclusive_offers?${params.toString()}`;
      },
      providesTags: ['offers'],
    }),
    getOfferDetails: builder.query<Offer, number>({
      query: itemId => `/exclusive_offers/${itemId}`,
      providesTags: (result, error, id) => [{ type: 'offers', id }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetOffersQuery, useGetOfferDetailsQuery } = offersApi;
