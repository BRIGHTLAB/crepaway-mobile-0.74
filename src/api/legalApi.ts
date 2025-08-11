import { baseApi } from './baseApi';

export const legalApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        getLegal: builder.query<Legal, void>({
            query: () => '/legal',
        }),
    }),
    overrideExisting: true,
});

export const { useGetLegalQuery } = legalApi;