import { baseApi } from './baseApi';

export interface HomepageResponse {
    categories: Category[];
    featured_items: Item[];
    new_items: Item[];
    exclusive_offers: Offer[];
    favorite_items: Item[];
    best_sellers: Item[];
}

type HomeArgs = {
    branch: string | null;
    menuType?: OrderType['menu_type'];
    addressId?: number | null;
};

export const homeApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        getHomepage: builder.query<HomepageResponse, HomeArgs>({
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
            providesTags: ['homepage'],
            keepUnusedDataFor: 10,
        }),
        // getBanners: builder.query<{banners: Banner[]}, {branch: string}>({
        //   query: ({branch}) => `/banners?branch=${branch}`,
        // }),
    }),

    overrideExisting: true,
});

export const { useGetHomepageQuery,
    // useGetBannersQuery
} = homeApi;