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

interface PointsPreviewResponse {
    status: string;
    total_amount: number;
    unit: { id: number; name: string; slug: string };
    formula: string;
    formula_source: string;
    gain: number;
}

export const loyaltyApi = loyaltyBaseApi.injectEndpoints({
    endpoints: builder => ({
        getTiers: builder.query<LoyaltyTier[], void>({
            query: () => ({
                url: '/me/tiers',
                method: 'GET',
            }),
            providesTags: ['tiers'],
            keepUnusedDataFor: 0,
        }),
        getTierProgress: builder.query<TierProgress, GetTierProgressParams>({
            query: () => ({
                url: `/me/tier-progress`,
                method: 'GET',
            }),
            providesTags: ['loyalty'],
            keepUnusedDataFor: 0,
        }),
        getPointsHistory: builder.query<PointsHistoryResponse, GetPointsHistoryParams>({
            query: ({ unitKey }) => ({
                url: `/me/points-history`,
                method: 'GET',
                params: unitKey ? { unit_key: unitKey } : undefined,
            }),
            providesTags: ['loyalty'],
            keepUnusedDataFor: 0,
        }),
        getPointsPreview: builder.query<PointsPreviewResponse, { totalAmount: number }>({
            query: ({ totalAmount }) => {
                console.log('[Grant] GET /me/points-preview called with totalAmount:', totalAmount);
                return {
                    url: `/me/points-preview`,
                    method: 'GET',
                    params: {
                        total_amount: totalAmount,
                        unit_key: 'points',
                    },
                };
            },
            transformResponse: (response: PointsPreviewResponse) => {
                console.log('[Grant] GET /me/points-preview response:', JSON.stringify(response));
                return response;
            },
            keepUnusedDataFor: 0,
        }),
        getBalance: builder.query<{ balance: number }, void>({
            query: () => {
                console.log('[Grant] GET /me/balance called');
                return {
                    url: '/me/balance',
                    method: 'GET',
                };
            },
            transformResponse: (response: { balance: number; non_expired_balance?: number; available_balance?: number; unit_id: number; unit_name: string; unit_slug?: string }[]) => {
                console.log('[Grant] GET /me/balance raw response:', JSON.stringify(response));
                // Response is an array of unit balances — find the "Points" entry
                const pointsEntry = response.find(
                    (entry) => entry.unit_name === 'Points' || entry.unit_id === 1 || entry.unit_slug === 'points'
                );
                // Prefer non_expired_balance/available_balance since 'balance' may include expired points
                const balance = pointsEntry?.non_expired_balance
                    ?? pointsEntry?.available_balance
                    ?? pointsEntry?.balance
                    ?? 0;
                console.log('[Grant] GET /me/balance extracted points balance:', balance);
                return { balance };
            },
            providesTags: ['loyalty'],
            keepUnusedDataFor: 0,
        }),
    }),
    overrideExisting: true,
});

export const { useGetTiersQuery, useGetTierProgressQuery, useGetPointsHistoryQuery, useGetPointsPreviewQuery, useGetBalanceQuery } = loyaltyApi;


