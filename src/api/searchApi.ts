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
        getSearchHistory: builder.query<SearchHistory[], void>({
            query: () => `/search_history?limit=999`,
        }),
    }),
    overrideExisting: true,
});

export const { useGetSearchHistoryQuery } = searchApi;

