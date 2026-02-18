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
  payment_methods_id: number | null; // Renamed from users_payment_methods_id to match backend
  address_id: number | null;
  delivery_instructions?: { id: number }[];
  is_scheduled: number;
  scheduled_date: string | null;
  order_type: string | null;
  cutleries?: number;
  promo_code?: string;
  save_card?: boolean;
}

export interface PaymentMethod {
  id: number;
  type: string;
  title: string;
  alias?: string;
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

// Response from GET /payments/{id} for polling
export interface PaymentStatusResponse {
  success: boolean;
  payment: {
    id: number;
    status: string; // 'pending' | 'success' | 'failed'
    orders_id: number | null; // null until webhook creates the order
    amount: string;
    currency: string;
    description: string | null;
    order_type: string;
    payment_provider: string;
    users_id: number;
    tips_amount: string | null;
    delete_reason: string | null;
    deleted_by: string | null;
  };
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

    // Updated to handle both COD and card payment flows
    placeOrder: builder.mutation<{
      message: string;
      order_id?: number;       // Present for COD/cash payments
      payment_url?: string;    // Present for card payments
      payment_id?: number;     // Present for card payments
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

    // Get payment status (for polling after card payment success)
    getPaymentStatus: builder.query<PaymentStatusResponse, number>({
      query: (paymentId) => `/payments/${paymentId}`,
      keepUnusedDataFor: 0, // Don't cache - always fetch fresh
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetCheckoutQuery,
  usePlaceOrderMutation,
  useGetPaymentMethodsQuery,
  useLazyGetPaymentStatusQuery,
} = checkoutApi;