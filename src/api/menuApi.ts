import { baseApi } from './baseApi';

type CommonArgs = {
    branch: string | null;
    menuType?: OrderType['menu_type'];
    addressId?: number | null;
};

export const menuApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<Category[], CommonArgs>({
            query: ({ menuType, branch, addressId }) => {
                const params = new URLSearchParams();
                if (menuType) params.append('menu_type', menuType);
                if (branch) params.append('branch', branch);
                params.append('limit', '999');

                // Add address_id if it exists
                if (addressId) {
                    params.append('address_id', addressId.toString());
                }

                return `/categories?${params.toString()}`;
            },
            providesTags: ['categories'],
        }),

        getItems: builder.query<{ data: Item[] }, CommonArgs>({
            query: ({ menuType, branch, addressId }) => {
                const params = new URLSearchParams();
                if (menuType) params.append('menu_type', menuType);
                if (branch) params.append('branch', branch);
                params.append('limit', '999');

                // Add address_id if it exists
                if (addressId) {
                    params.append('address_id', addressId.toString());
                }

                return `/items?${params.toString()}`;
            },
            providesTags: ['items'],
        }),

        getItemDetails: builder.query<Item, CommonArgs & { itemId: number }>({
            query: ({ itemId, menuType, branch, addressId }) => {
                const params = new URLSearchParams();
                if (menuType) params.append('menu_type', menuType);
                if (branch) params.append('branch', branch);

                // Add address_id if it exists
                if (addressId) {
                    params.append('address_id', addressId.toString());
                }

                return `/items/${itemId}?${params.toString()}`;
            },
            providesTags: (result, error, { itemId }) => [{ type: 'items', id: itemId }],
            keepUnusedDataFor: 0,
        }),


        toggleFavorite: builder.mutation<
            { success: boolean },
            CommonArgs & { itemId: number }
        >({
            query: ({ itemId, menuType, branch, addressId }) => {
                const params = new URLSearchParams();
                if (menuType) params.append('menu_type', menuType);
                if (branch) params.append('branch', branch);

                // Add address_id if it exists
                if (addressId) {
                    params.append('address_id', addressId.toString());
                }

                return {
                    url: `/favorite_items/${itemId}?${params.toString()}`,
                    method: 'POST',
                };
            },
            invalidatesTags: (result, error, { itemId }) => [
                { type: 'items', id: itemId },
                'favorites',
                'homepage',
                'items',
            ],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetCategoriesQuery,
    useGetItemsQuery,
    useGetItemDetailsQuery,
    useToggleFavoriteMutation
} = menuApi;