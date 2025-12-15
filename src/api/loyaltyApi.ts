import { loyaltyBaseApi } from './baseApi';

export const loyaltyApi = loyaltyBaseApi.injectEndpoints({
    endpoints: builder => ({
        getTiers: builder.query<LoyaltyTier[], void>({
            query: () => ({
                url: '/tiers',
                method: 'GET',
            }),
            providesTags: ['tiers'],
        }),
    }),
    overrideExisting: true,
});

export const { useGetTiersQuery } = loyaltyApi;

