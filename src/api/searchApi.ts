import { baseApi } from "./baseApi";

interface SearchHistory {
    id: number;
    search_value: string;
    counter: number;
    created_at: string;
    updated_at: string;
    users_id: number;
}

export const searchApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSearchResults: builder.query<{
            categories: Category[];
            new_items: Item[];
            exclusive_offers: Offer[];
            favorite_items: Item[];
            best_sellers: Item[];
        }, { menuType: OrderType['menu_type'], branch: string | null, searchValue: string, addressId?: number | null }>({
            query: ({ menuType, branch, searchValue, addressId }) => {
                const params = new URLSearchParams();
                if (menuType) params.append('menu_type', menuType);
                if (branch) params.append('branch', branch);
                if (searchValue) params.append('search', searchValue);

                // Add address_id if it exists
                if (addressId) {
                    params.append('address_id', addressId.toString());
                }

                return `/homepage?${params.toString()}`;
            },
        }),
        getSearchHistory: builder.query<SearchHistory[], void>({
            query: () => `/search_history?limit=999`,
        }),
    }),
    overrideExisting: true,
});

export const { useGetSearchResultsQuery, useGetSearchHistoryQuery } = searchApi;

