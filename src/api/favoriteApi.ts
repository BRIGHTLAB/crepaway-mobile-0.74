import { baseApi } from './baseApi';

export interface FavoritesResponse {
    favorite_items: Item[];
}

export const favoritesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFavorites: builder.query<Item[], { menu: string; branch: string }>({
            query: ({ menu, branch }) => `/homepage?menu=${menu}&branch=${branch}`,
            transformResponse: (response: {
                favorite_items: Item[];
            }) => response.favorite_items || [],
            providesTags: ['favorites'],
        }),

        // toggleFavorite: builder.mutation<{success: boolean}, {itemId: number; isFavorite: boolean}>({
        //   query: ({itemId, isFavorite}) => ({
        //     url: `/items/${itemId}/favorite`,
        //     method: isFavorite ? 'DELETE' : 'POST',
        //   }),
        //   invalidatesTags: ['profile'], // Invalidate profile to refresh favorites
        // }),
    }),
    overrideExisting: true,
});

export const { useGetFavoritesQuery,
    //  useToggleFavoriteMutation 
} = favoritesApi;