import { baseApi } from './baseApi';


export const featuredItemsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        featuredItems: builder.query<Item[], { menu: string; branch: string }>({
            query: ({ menu, branch }) => `/homepage?menu=${menu}&branch=${branch}`,
            transformResponse: (response: {
                featured_items: Item[];
            }) => response.featured_items || [],
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

export const {
    useFeaturedItemsQuery,
} = featuredItemsApi;