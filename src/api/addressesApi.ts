import {baseApi} from './baseApi';

export const addresses = baseApi.injectEndpoints({
  endpoints: builder => ({
    getAddresses: builder.query<Address[], void>({
      query: () => `/addresses`,
      providesTags: ['addresses'],
    }),
    deleteAddress: builder.mutation<{message: string}, {id: number}>({
      query: ({id}) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['addresses'],
    }),
    addAddresses: builder.mutation<
      {message: string},
      {addresses: Partial<Address>[]}
    >({
      query: ({addresses}) => ({
        url: `/addresses`,
        method: 'POST',
        body: addresses,
      }),
      invalidatesTags: ['addresses'],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetAddressesQuery,
  useDeleteAddressMutation,
  useAddAddressesMutation,
} = addresses;
