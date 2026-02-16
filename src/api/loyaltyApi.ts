import { loyaltyBaseApi } from './baseApi';

interface GetTierProgressParams {
    unitKey?: string;
}

interface PointsHistoryTransaction {
    id: number;
    date: string;
    amount: number;
    points: number;
    type: string;
    description: string;
}

interface PointsHistoryResponse {
    transactions: PointsHistoryTransaction[];
    overall_balance: number;
    unit: {
        id: number;
        name: string;
        slug: string;
    };
}

interface GetPointsHistoryParams {
    unitKey?: string;
}

export const loyaltyApi = loyaltyBaseApi.injectEndpoints({
    endpoints: builder => ({
        getTiers: builder.query<LoyaltyTier[], void>({
            query: () => ({
                url: '/me/tiers',
                method: 'GET',
            }),
            providesTags: ['tiers'],
        }),
        getTierProgress: builder.query<TierProgress, GetTierProgressParams>({
            query: () => ({
                url: `/me/tier-progress`,
                method: 'GET',
            }),
            providesTags: ['loyalty'],
        }),
        getPointsHistory: builder.query<PointsHistoryResponse, GetPointsHistoryParams>({
            query: ({ unitKey }) => ({
                url: `/me/points-history`,
                method: 'GET',
                params: unitKey ? { unit_key: unitKey } : undefined,
            }),
            providesTags: ['loyalty'],
        }),
    }),
    overrideExisting: true,
});

export const { useGetTiersQuery, useGetTierProgressQuery, useGetPointsHistoryQuery } = loyaltyApi;


