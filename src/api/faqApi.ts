import { baseApi } from './baseApi';

export const faqApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        getFAQ: builder.query<FAQ, void>({
            query: () => '/faq',
        }),
    }),
    overrideExisting: true,
});

export const { useGetFAQQuery } = faqApi;