import { baseApi } from './baseApi';
import { homeApi } from './homeApi';

export const menuApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<Category[], { menu: string; branch: string }>({
            query: ({ menu, branch }) =>
                `/categories?menu=${menu}&branch=${branch}&limit=999`,
            providesTags: ['categories'],
        }),

        getItems: builder.query<{
            data: Item[]
        }, { menu: string; branch: string }>({
            query: ({ menu, branch }) =>
                `/items?menu=${menu}&branch=${branch}&limit=999`,
            // providesTags: (result) =>
            //     result
            //         ? [
            //             ...result.map(({ id }) => ({ type: 'items' as const, id })),
            //             { type: 'items', id: 'LIST' }
            //         ]
            //         : [{ type: 'items', id: 'LIST' }],
            providesTags: ['items'],
        }),

        getItemDetails: builder.query<Item, { itemId: number; menu: string; branch: string }>({
            query: ({ itemId, menu, branch }) =>
                `/items/${itemId}?menu=${menu}&branch=${branch}`,
            providesTags: (result, error, arg) => [{ type: 'items', id: arg.itemId }],
            keepUnusedDataFor: 0,
        }),


        toggleFavorite: builder.mutation<{ success: boolean }, { itemId: number; menu: string; branch: string }>({
            query: ({ itemId, menu, branch }) => ({
                url: `/favorite_items/${itemId}?menu=${menu}&branch=${branch}`,
                method: 'POST',
            }),

            // async onQueryStarted({ itemId, menu, branch }, { dispatch, queryFulfilled }) {
            //     try {
            //         await queryFulfilled;
            //         dispatch(
            //             homeApi.util.invalidateTags(['homepage'])
            //         );
            //     } catch {
            //     }
            // },
            invalidatesTags: (result, error, arg) => [
                { type: 'items', id: arg.itemId },
                'favorites',
                'homepage',
                'items'
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