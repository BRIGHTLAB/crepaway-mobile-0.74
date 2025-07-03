import {baseApi} from './baseApi';

export const offersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getOffers: builder.query<Offer[], {menu: string; branch: string}>({
      query: ({menu, branch}) =>
        `/exclusive_offers?menu=${menu}&branch=${branch}`,
      providesTags: ['offers'],
    }),
    getOfferDetails: builder.query<Offer, number>({
      query: itemId => `/exclusive_offers/${itemId}`,
      providesTags: (result, error, id) => [{type: 'offers', id}],
    }),
  }),
  overrideExisting: true,
});

export const {useGetOffersQuery, useGetOfferDetailsQuery} = offersApi;
