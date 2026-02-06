import { baseApi } from './baseApi';

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

export interface PaymentMethod {
  id: number;
  type: string;
  title: string;
  pos_payment_type_id: number;
  removed: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  image_url?: string | null;
}

export interface PaymentMethodsResponse {
  current_page: number;
  data: PaymentMethod[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
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

    getPaymentMethods: builder.query<PaymentMethodsResponse, void>({
      query: () => `/payment_methods`,
      keepUnusedDataFor: 60, // Cache for 60 seconds
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
    }),
  }),

  overrideExisting: true,
});

export const { useGetCheckoutQuery, usePlaceOrderMutation, useGetPaymentMethodsQuery } = checkoutApi;