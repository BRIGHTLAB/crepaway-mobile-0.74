import { CartItem } from '../store/slices/cartSlice';
import store from '../store/store';
import { baseApi } from './baseApi';

export const cartApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCart: builder.query<{ items: { [uuid: string]: CartItem } }, void>({
            query: () => '/cart',
            keepUnusedDataFor: 0,
            providesTags: ['cart'],
            transformResponse: (response: { items: { [uuid: string]: CartItem } }) => {
                return {
                    items: response?.items ? JSON.parse(JSON.stringify(response?.items)) : {}
                };
            },
        }),
        addToCart: builder.mutation<void, { items: CartItem[], menu_type: string }>({
            query: ({ items, menu_type }) => {
                const branchAlias = store.getState().user.branchAlias;
                const addressId = store.getState().user.addressId;
                const baseUrl = '/cart';

                const params = new URLSearchParams();
                if (menu_type === 'takeaway' && branchAlias) {
                    params.append('branch', branchAlias);
                }
                if (menu_type === 'delivery' && addressId) {
                    params.append('address_id', addressId.toString());
                }
                params.append('menu_type', menu_type);

                const queryString = params.toString();
                const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

                return {
                    url,
                    method: 'POST',
                    body: {
                        items,
                        menu_type,
                    },
                }

            },
            // invalidatesTags: ['cart'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled
                    // setTimeout(() => {
                    //     dispatch(
                    //         cartApi.util.invalidateTags(['cart'])
                    //     );
                    // }, 3000);

                    console.log('Cart synced with server');

                } catch (error) {
                    console.error('Error syncing cart:', error);
                }
            },
        }),

    }),
    overrideExisting: true,

});

export const {
    useGetCartQuery,
    useAddToCartMutation,
} = cartApi;