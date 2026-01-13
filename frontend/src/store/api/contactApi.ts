import { baseApi } from './baseApi';

export const contactApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        sendContactMessage: builder.mutation<{ status: string; message: string }, { firstName: string; lastName: string; email: string; message: string }>({
            query: (body) => ({
                url: '/contact',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useSendContactMessageMutation } = contactApi;
