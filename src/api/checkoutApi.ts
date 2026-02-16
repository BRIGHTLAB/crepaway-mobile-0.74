import { baseApi, loyaltyBaseApi } from './baseApi';

export interface Checkout {
  summary: {
    original_sub_total: string;
    total_discount: string;
    final_total: string;
    promo_code_applied: boolean;
    promo_code_error?: string | null;
  };
  delivery_charge: string;
  points_rewarded: number;
  currency: Currency;
}

export interface OrderFormData {
  special_delivery_instructions: string;
  users_payment_methods_id: number;
  address_id: number | null;
  delivery_instructions?: { id: number }[];
  is_scheduled: number;
  scheduled_date: string | null;
  order_type: string | null;
}

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getCheckout: builder.query<Checkout, { promoCode: string | void }>({
      query: ({ promoCode }) => {
        const params = new URLSearchParams();

        if (promoCode) {
          params.append('code', promoCode);
        }
        const queryString = params.toString();

        console.log('queryParrams', queryString)
        return `/checkout${queryString ? `?${queryString}` : ''}`;
      },
      // providesTags: ['checkout'],
      keepUnusedDataFor: 1,
    }),

    // TO CHECK null type
    placeOrder: builder.mutation<{
      order_id: number;
    }, OrderFormData>({
      query: formData => {
        const baseUrl = '/orders';
        const params = new URLSearchParams();

        const queryString = params.toString();

        return {
          url: `${baseUrl}${queryString ? `?${queryString}` : ''}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Order', 'checkout'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(loyaltyBaseApi.util.invalidateTags(['loyalty']));
      },
    }),
  }),

  overrideExisting: true,
});

export const { useGetCheckoutQuery, usePlaceOrderMutation } = checkoutApi;