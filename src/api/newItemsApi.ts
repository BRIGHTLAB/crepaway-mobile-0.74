import { baseApi } from './baseApi';

type CommonArgs = {
    branch: string | null;
    menuType?: OrderType['menu_type'];
    addressId?: number | null;
};


export const newItemsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        newItems: builder.query<Item[], CommonArgs>({
            query: ({ menuType, branch, addressId }) => {
                const params = new URLSearchParams();
                if (menuType) params.append('menu_type', menuType);
                if (branch) params.append('branch', branch);

                // Add address_id if it exists
                if (addressId) {
                    params.append('address_id', addressId.toString());
                }

                return `/homepage?${params.toString()}`;
            },
            transformResponse: (response: { new_items: Item[] }) =>
                response.new_items || [],
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