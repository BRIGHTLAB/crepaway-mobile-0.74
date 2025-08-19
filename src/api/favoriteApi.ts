import { baseApi } from './baseApi';

export interface FavoritesResponse {
    favorite_items: Item[];
}

type CommonArgs = {
    branch: string | null;
    menuType?: OrderType['menu_type'];
    addressId?: number | null;
};

export const favoritesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFavorites: builder.query<Item[], CommonArgs>({
            query: ({ menuType, branch, addressId }) => {
                const params = new URLSearchParams();
                if (menuType) params.append('menu_type', menuType);
                if (branch) params.append('branch', branch);

                // Add address_id if it exists
                if (addressId) {
                    params.append('users_addresses_id', addressId.toString());
                }

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
