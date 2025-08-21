import { baseApi } from './baseApi';

export const offersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getOffers: builder.query<Offer[], { menuType?: OrderType['menu_type']; branch: string | null; addressId?: number | null }>({
      query: ({ branch, menuType, addressId }) => {
        const params = new URLSearchParams();
        if (menuType) params.append('menu_type', menuType);
        if (branch) params.append('branch', branch);

        // Add address_id if it exists
        if (addressId) {
          params.append('address_id', addressId.toString());
        }

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
