import store from '../store/store';
import { baseApi } from './baseApi';

export interface Checkout {
  summary: {
    original_sub_total: string;
    total_discount: string;
    final_total: string;
    promo_code_applied: boolean;
  };
  delivery_charge: string;
  points_rewarded: number;
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
        const user = store.getState().user;
        const usersAddressesId = user.addressId;
        const orderType = user.orderType;
        const params = new URLSearchParams();

        if (promoCode) {
          params.append('code', promoCode);
        }

        if (orderType) {
          params.append('order_type', orderType);
        }

        if (usersAddressesId) {
          params.append('address_id', usersAddressesId.toString());
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
        const branchName = store.getState().user.branchName;
        const usersAddressesId = store.getState().user.addressId;
        const baseUrl = '/orders';

        const params = new URLSearchParams();

        if (formData.order_type === 'takeaway' && branchName) {
          params.append('branch', branchName);
        }

        if (usersAddressesId) {
          params.append('address_id', usersAddressesId.toString());
        }

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

export const { useGetCheckoutQuery, usePlaceOrderMutation } = checkoutApi;