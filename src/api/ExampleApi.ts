// import {baseApi} from './baseApi';

// export const ordersApi = baseApi.injectEndpoints({
//   endpoints: builder => ({
//     getScannedOrders: builder.mutation<Order[], {order_reference: string[]}>({
//       query: ({order_reference}) => ({
//         url: '/scan_orders',
//         method: 'POST',
//         body: {order_reference},
//       }),
//     }),
//     deliverOrder: builder.mutation<
//       Order,
//       {
//         order_reference: string;
//       }
//     >({
//       query: ({order_reference}) => ({
//         url: '/deliver_order',
//         method: 'POST',
//         body: {order_reference},
//       }),
//       invalidatesTags: ['Orders'],
//     }),
//     assignOrderToDriver: builder.mutation<
//       {message: string},
//       {order_reference: string[]}
//     >({
//       query: ({order_reference}) => ({
//         url: '/assign_orders',
//         method: 'POST',
//         body: {order_reference},
//       }),
//       invalidatesTags: ['Orders'],
//     }),
//     getOrder: builder.query<Order, number>({
//       query: id => `/orders/${id}`,
//       providesTags: (_result, _error, id) => (id ? [{type: 'Order', id}] : []), // Return an empty array if id is null or undefined
//     }),
//     getDriverOrders: builder.query<Order[], string | void>({
//       query: filter_by =>
//         filter_by ? `/orders?filter_by=${filter_by}` : `/orders`,
//       providesTags: ['Orders'],
//     }),
//   }),
//   overrideExisting: true,
// });

// export const {
//   useGetScannedOrdersMutation,
//   useGetOrderQuery,
//   useAssignOrderToDriverMutation,
//   useGetDriverOrdersQuery,
//   useLazyGetDriverOrdersQuery,
//   useDeliverOrderMutation,
// } = ordersApi;
