import { baseApi } from './baseApi';

export interface FavoritesResponse {
    favorite_items: Item[];
}

type CommonArgs = {
    branch: string;
    menu?: string;
    menuType?: OrderType['menu_type'];
};

export const favoritesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFavorites: builder.query<Item[], CommonArgs>({
            query: ({ menu, menuType, branch }) => {
                const params = new URLSearchParams();
                if (menu) params.append('menu', menu);
                if (menuType) params.append('menu_type', menuType);
                params.append('branch', branch);
                return `/homepage?${params.toString()}`;
            },
            transformResponse: (response: FavoritesResponse) =>
                response.favorite_items || [],
            providesTags: ['favorites'],
        }),

        // toggleFavorite: builder.mutation<{ success: boolean }, { itemId: number; isFavorite: boolean }>({
        //   query: ({ itemId, isFavorite }) => ({
        //     url: `/items/${itemId}/favorite`,
        //     method: isFavorite ? 'DELETE' : 'POST',
        //   }),
        //   invalidatesTags: ['profile'],
        // }),
    }),
    overrideExisting: true,
});

export const {
    useGetFavoritesQuery,
    // useToggleFavoriteMutation 
} = favoritesApi;
