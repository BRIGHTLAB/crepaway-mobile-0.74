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
        }, { menu: string, branch: string, searchValue: string }>({
            query: ({ menu, branch, searchValue }) => `/homepage?menu=${menu}&branch=${branch}${searchValue ? `&search=${searchValue}` : ''}`,
        }),
        getSearchHistory: builder.query<SearchHistory[], void>({
            query: () => `/search_history?limit=999`,
        }),
    }),
    overrideExisting: true,
});

export const { useGetSearchResultsQuery, useGetSearchHistoryQuery } = searchApi;

