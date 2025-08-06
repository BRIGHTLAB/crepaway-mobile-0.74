import { baseApi } from './baseApi';

type CommonArgs = {
    branch: string;
    menu?: string;
    menuType?: OrderType['menu_type'];
};


export const newItemsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        newItems: builder.query<Item[], CommonArgs>({
            query: ({ menu, menuType, branch }) => {
                const params = new URLSearchParams();
                if (menu) params.append('menu', menu);
                if (menuType) params.append('menu_type', menuType);
                params.append('branch', branch);
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