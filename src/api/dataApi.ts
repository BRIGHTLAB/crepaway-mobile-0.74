import {baseApi} from './baseApi';

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

export const dataApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getCities: builder.query<City[], void>({
      query: () => `/cities`,
    }),
    getAllergens: builder.query<Allergen[], {search: string}>({
      query: ({search}) => `/allergens?search=${search}`,
      providesTags: ['allergens'],
    }),
    getZones: builder.query<Zone[], void>({
      query: () => `/zones`,
    }),
  }),

  overrideExisting: true,
});

export const {useGetCitiesQuery, useGetAllergensQuery, useGetZonesQuery} =
  dataApi;
