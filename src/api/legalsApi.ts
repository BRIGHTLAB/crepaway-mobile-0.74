import { baseApi } from './baseApi';

export const legalsApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        getLegalContent: builder.query<LegalContent, string>({
            query: (key) => `/legals/${key}`,
            providesTags: (result, error, key) => [{ type: 'legals', id: key }],
        }),
    }),
    overrideExisting: true,
});

export const { useGetLegalContentQuery } = legalsApi;