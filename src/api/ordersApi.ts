import { DeliveryInstructions } from '../components/Checkout/DeliveryInstructionsSheet';
import { baseApi } from './baseApi';
interface OrderItemModifierItem {
  id: number;
  name: string;
  price: number | null;
  quantity: number;
  total_price: number;
  symbol?: string;
  plu: string;
}

interface OrderItemModifierGroup {
  id: number;
  name: string;
  modifier_items: OrderItemModifierItem[];
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total_price: number;
  total_discounted: number;
  special_instruction: string;
  description?: string;
  plu: string;
  uuid: string;
  symbol?: string;
  image_url?: string;
  modifier_groups: OrderItemModifierGroup[];
}

export interface Order {
  id: number;
  order_number: string;
  order_date: string;
  status: Status;
  order_type: string;
  branch: {
    id: number;
    name: string;
  };
  address: Partial<Address>;
  driver: {
    name: string | null;
    phone: string | null;
  };
  items: OrderItem[];
  sub_total: number;
  delivery_charge: number | null;
  points_rewarded: number | null;
  total: {
    default_currency: number;
    pos_currency: number;
  };
  currency: Currency;
  pos_currency: Currency;
  payment_method: {
    id: number;
    type: string;
    title: string;
  };
  promo_code: {
    code: string | null;
    type: string | null;
    name: string | null;
    value: number | null;
  };
  vat: {
    percentage: number;
    amount: number;
  };
  special_delivery_instructions: string | null;
  delivery_instructions: DeliveryInstructions[];
  estimated_arrival: string;
  schedule_order: number;
  schedule_date: string | null;
  food_rating: number | null;
  experience_rating: number | null;
  service_rating: number | null;
  review_comment: string | null;
  cutleries?: boolean | null; // Optional - requires backend support
  rating?: OrderRatingPayload | null; // Order rating if already rated
  delivered_at?: string | null; // Timestamp when order was delivered

}

// Simplified order type for list responses (history/ongoing)
export interface OrderListItem {
  id: number;
  order_number: string;
  order_date: string;
  menu_type: string;
  order_type: string;
  status: string;
  status_id: number;
  payment_method_type: string;
  address: Partial<Address>;
  items: OrderItem[];
  cutleries: number; // 0 or 1
  sub_total: string;
  delivery_charge: string;
  total: string;
  pos_total: string;
  currency: Currency;
  rating: number | null;
  experience_rating: number | null;
  food_rating: number | null;
  service_rating: number | null;
  review_comment: string | null;
  delivered_at: string | null;
}

export type OrdersResponse = {
  ongoing: OrderListItem[];
  history: OrderListItem[];
};

export type OrderStatusResponse = {
  status_history: {
    name: string;
    key: string;
    date: string;
    update_reason: string | null;
  }[];
  estimated_delivery_time: string;
  driver: {
    id: number;
    full_name: string;
    image_url: string | null;
    phone_number: string | null;
  } | null;
};

export interface OrderRatingPayload {
  food_rating: number;
  experience_rating: number;
  service_rating: number;
  review_comment?: string | null;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getOrders: builder.query<OrdersResponse | null, void>({
      query: () => ({
        url: '/orders',
        method: 'GET',
      }),
      providesTags: ['Order'],
    }),
    getOrderTypes: builder.query<OrderType[], void>({
      query: () => `/order_types`,
    }),
    getOrder: builder.query<Order, number>({
      query: id => `/orders/${id}`,
      providesTags: (_result, _error, id) => (id ? [{ type: 'Order', id }] : []), // Return an empty array if id is null or undefined
      keepUnusedDataFor: 0, // Force refetch every time screen opens
    }),
    getOrderStatus: builder.query<OrderStatusResponse, number>({
      query: id => `/orders/${id}/status`,
      providesTags: (_result, _error, id) =>
        id ? [{ type: 'orderStatus', id }] : [], // Return an empty array if id is null or undefined
    }),
    rateOrder: builder.mutation<{ message: string }, { orderId: number; payload: OrderRatingPayload }>({
      query: ({ orderId, payload }) => ({
        url: `/orders/${orderId}/ratings`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
      ],
    }),
    getPendingRating: builder.query<Order | null, void>({
      query: () => ({
        url: '/orders/pending-rating',
        method: 'GET',
      }),
      providesTags: ['Order'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetOrdersQuery,
  useGetOrderTypesQuery,
  useGetOrderQuery,
  useGetOrderStatusQuery,
  useRateOrderMutation,
  useGetPendingRatingQuery,
} = ordersApi;
