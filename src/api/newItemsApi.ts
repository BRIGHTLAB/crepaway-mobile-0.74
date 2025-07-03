import { baseApi } from './baseApi';


export const newItemsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        newItems: builder.query<Item[], { menu: string; branch: string }>({
            query: ({ menu, branch }) => `/homepage?menu=${menu}&branch=${branch}`,
            transformResponse: (response: {
                new_items: Item[];
            }) => response.new_items || [],
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

export const {
    useNewItemsQuery,
} = newItemsApi;