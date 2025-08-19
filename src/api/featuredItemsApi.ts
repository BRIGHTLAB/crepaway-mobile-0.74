import { baseApi } from './baseApi';


export const featuredItemsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        featuredItems: builder.query<Item[], { menuType: string; branch: string | null; addressId?: number | null }>({
            query: ({ menuType, branch, addressId }) => {
                const params = new URLSearchParams();
                params.append('menu_type', menuType);
                if (branch) params.append('branch', branch);

                // Add address_id if it exists
                if (addressId) {
                    params.append('users_addresses_id', addressId.toString());
                }

                return `/homepage?${params.toString()}`;
            },
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