import { baseApi } from './baseApi';

type CommonArgs = {
    branch: string;
    menu?: string;
    menuType?: OrderType['menu_type'];
};

export const menuApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<Category[], CommonArgs>({
            query: ({ menu, menuType, branch }) => {
                const params = new URLSearchParams();
                if (menu) params.append('menu', menu);
                if (menuType) params.append('menu_type', menuType);
                params.append('branch', branch);
                params.append('limit', '999');
                return `/categories?${params.toString()}`;
            },
            providesTags: ['categories'],
        }),

        getItems: builder.query<{ data: Item[] }, CommonArgs>({
            query: ({ menu, menuType, branch }) => {
                const params = new URLSearchParams();
                if (menu) params.append('menu', menu);
                if (menuType) params.append('menu_type', menuType);
                params.append('branch', branch);
                params.append('limit', '999');
                return `/items?${params.toString()}`;
            },
            providesTags: ['items'],
        }),

        getItemDetails: builder.query<Item, CommonArgs & { itemId: number }>({
            query: ({ itemId, menu, menuType, branch }) => {
                const params = new URLSearchParams();
                if (menu) params.append('menu', menu);
                if (menuType) params.append('menu_type', menuType);
                params.append('branch', branch);
                return `/items/${itemId}?${params.toString()}`;
            },
            providesTags: (result, error, { itemId }) => [{ type: 'items', id: itemId }],
            keepUnusedDataFor: 0,
        }),


        toggleFavorite: builder.mutation<
            { success: boolean },
            CommonArgs & { itemId: number }
        >({
            query: ({ itemId, menu, menuType, branch }) => {
                const params = new URLSearchParams();
                if (menu) params.append('menu', menu);
                if (menuType) params.append('menu_type', menuType);
                params.append('branch', branch);
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