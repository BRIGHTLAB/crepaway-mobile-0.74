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
    branch: string;
    menu?: string;
    menuType?: OrderType['menu_type'];
};

export const homeApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        getHomepage: builder.query<HomepageResponse, HomeArgs>({
            query: ({ menu, menuType, branch }) => {
                const params = new URLSearchParams();
                if (menu) params.append('menu', menu);
                if (menuType) params.append('menu_type', menuType);
                params.append('branch', branch);
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