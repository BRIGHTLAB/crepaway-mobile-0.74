import { baseApi } from './baseApi';

export interface UserPromo {
    id: number;
    name: string;
    code: string;
    discount_type: 'percentage' | 'fixed-value';
    amount: number;
    max_amount: number | null;
    end_date: string | null;
}

export interface HomepageResponse {
    categories: Category[];
    featured_items: Item[];
    new_items: Item[];
    exclusive_offers: Offer[];
    favorite_items: Item[];
    best_sellers: Item[];
    user_promos: UserPromo[];
    currency: {
        id: number;
        symbol: string;
        name: string;
        exchange: number;
    } | null;
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
                    params.append('address_id', addressId.toString());
                }

                return `/homepage?${params.toString()}`;
            },
            providesTags: ['homepage'],
            keepUnusedDataFor: 10,
        }),
        getBanners: builder.query<{banners: any}, {branch: string}>({
          query: ({branch}) => {
            const params = new URLSearchParams();
            if (branch) params.append('branch', branch);    
            return `/banners?${params.toString()}`;
          },
        }),
    }),

    overrideExisting: true,
});

export const { useGetHomepageQuery,
    useGetBannersQuery,
} = homeApi;