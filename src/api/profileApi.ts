import {baseApi} from './baseApi';

export const profileApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getProfile: builder.query<Profile, void>({
      query: () => `/profile`,
      providesTags: ['profile'],
    }),
    updateProfile: builder.mutation<{message: string}, Partial<Profile>>({
      query: profileData => ({
        url: `/profile`,
        method: 'POST',
        body: profileData,
      }),
      invalidatesTags: ['profile'],
    }),
    deleteAccount: builder.mutation<{message: string}, void>({
      query: () => ({
        url: `/delete_account`,
        method: 'DELETE',
      }),
      invalidatesTags: ['profile'],
    }),
    getSignedUrl: builder.query<
      {
        signedUrl: string;
        key: string;
      },
      {objectName: string}
    >({
      query: ({objectName}) => ({
        url: '/sign_url',
        params: {objectName},
      }),
    }),
    // updateProfileImage: builder.mutation<{message: string; image_url: string}, FormData>({
    //   query: (formData) => ({
    //     url: `/profile/image`,
    //     method: 'POST',
    //     body: formData,
    //     formData: true,
    //   }),
    //   invalidatesTags: ['profile'],
    // }),
  }),
  overrideExisting: true,
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useLazyGetSignedUrlQuery,
} = profileApi;
