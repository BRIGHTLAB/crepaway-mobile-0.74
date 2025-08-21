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
        addToCart: builder.mutation<void, { items: CartItem[], order_type: string }>({
            query: ({ items, order_type }) => {
                const branchName = store.getState().user.branchName;
                const addressId = store.getState().user.addressId;
                const baseUrl = '/cart';

                const params = new URLSearchParams();
                if (order_type === 'takeaway' && branchName) {
                    params.append('branch', branchName);
                }
                if (addressId) {
                    params.append('address_id', addressId.toString());
                }

                const queryString = params.toString();
                const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

                return {
                    url,
                    method: 'POST',
                    body: {
                        items,
                        order_type,
                    },
                }

            },
            // invalidatesTags: ['cart'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled
                    setTimeout(() => {
                        dispatch(
                            cartApi.util.invalidateTags(['cart'])
                        );
                    }, 3000);

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