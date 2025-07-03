import { baseApi } from './baseApi';

export interface HomepageResponse {
    categories: Category[];
    new_items: Item[];
    exclusive_offers: Offer[];
    favorite_items: Item[];
    best_sellers: Item[];
}

export const homeApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        getHomepage: builder.query<HomepageResponse, { menu: string; branch: string }>({
            query: ({ menu, branch }) => `/homepage?menu=${menu}&branch=${branch}`,
            providesTags: ['homepage'],
            keepUnusedDataFor: 10,
        })
        // getBanners: builder.query<{banners: Banner[]}, {branch: string}>({
        //   query: ({branch}) => `/banners?branch=${branch}`,
        // }),
    }),

    overrideExisting: true,
});

export const { useGetHomepageQuery,
    // useGetBannersQuery
} = homeApi;