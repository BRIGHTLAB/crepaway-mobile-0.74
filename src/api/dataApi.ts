import { baseApi } from './baseApi';

export interface Zone {
  id: number;
  name: string;
  delivery_charge: string;
  minimum_order_amount: string;
  estimated_delivery_time: number;
  created_at: string;
  updated_at: string;
  boundary: Array<{
    lat: number;
    lng: number;
  }>;
}
interface Content {
  id: number;
  key: string;
  image_url: string | null;
  title: string | null;
  description: string | null;
}


export const dataApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getAllergens: builder.query<Allergen[], { search: string }>({
      query: ({ search }) => `/allergens?search=${search}`,
      providesTags: ['allergens'],
    }),
    getZones: builder.query<Zone[], void>({
      query: () => `/zones`,
    }),
    getWaiterInstructions: builder.query<WaiterInstruction[], void>({
      query: () => `/waiter_instructions`,
    }),
    getContent: builder.query<Content[], void>({
      query: () => `/content`,
      keepUnusedDataFor: 0, // Keep data indefinitely until app restart
      extraOptions: {
        staleTime: Infinity, // Data never becomes stale
      }
    }),
  }),

  overrideExisting: true,
});

export const { useGetAllergensQuery, useGetContentQuery, useGetZonesQuery, useGetWaiterInstructionsQuery } =
  dataApi;
