import {baseApi} from './baseApi';

export const user = baseApi.injectEndpoints({
  endpoints: builder => ({
    updateAllergens: builder.mutation<{message: string}, Partial<Allergen>[]>({
      query: allergens => ({
        url: `/allergens`,
        method: 'POST',
        body: allergens,
      }),
      invalidatesTags: ['allergens'],
    }),
  }),

  overrideExisting: true,
});

export const {useUpdateAllergensMutation} = user;
