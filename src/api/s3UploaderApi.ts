// s3BaseApi.js
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export const s3BaseApi = createApi({
  reducerPath: 's3Api',
  baseQuery: fetchBaseQuery({
    // No base URL needed since S3 signed URLs are full URLs
    prepareHeaders: headers => {
      // Set only the Content-Type header if needed
      headers.set('Content-Type', 'application/octet-stream'); // or a dynamic value
      return headers;
    },
  }),
  endpoints: builder => ({
    uploadImage: builder.mutation<{message: string}, {url: string; file: Blob}>(
      {
        query: ({url, file}) => ({
          url,
          method: 'PUT',
          body: file,
        }),
      },
    ),
  }),
});

export const {useUploadImageMutation} = s3BaseApi;
