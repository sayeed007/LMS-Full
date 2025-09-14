import { baseApi, BaseApiResponse } from './baseApi';
import type { User } from '../slices/authSlice';
import type { Course } from './courseApi';

export interface Organization {
  _id: string;
  name: string;
  email: string;
  type: 'educational_institution' | 'corporate' | 'government' | 'non_profit' | 'other';
  description?: string;
  website?: string;
  logo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
  };
  settings?: {
    allowPublicCourses: boolean;
    requireApproval: boolean;
    customBranding: boolean;
  };
  isActive: boolean;
  memberCount: number;
  coursesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  email: string;
  type: 'educational_institution' | 'corporate' | 'government' | 'non_profit' | 'other';
  description?: string;
  website?: string;
  logo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
  };
}

export interface UpdateOrganizationRequest extends Partial<CreateOrganizationRequest> {
  settings?: {
    allowPublicCourses?: boolean;
    requireApproval?: boolean;
    customBranding?: boolean;
  };
}

export interface OrganizationListParams {
  page?: number;
  limit?: number;
  type?: string;
  isActive?: boolean;
  search?: string;
}

export interface AddMemberRequest {
  userId: string;
  role: 'student' | 'instructor' | 'org_admin';
}

export interface OrganizationStats {
  totalMembers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeInstructors: number;
  coursesThisMonth: number;
  enrollmentsThisMonth: number;
}

export const organizationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<BaseApiResponse<Organization[]>, OrganizationListParams | void>({
      query: (params) => ({
        url: '/organizations',
        params,
      }),
      providesTags: ['Organization'],
    }),

    getOrganizationById: builder.query<BaseApiResponse<{ organization: Organization }>, string>({
      query: (id) => `/organizations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Organization', id }],
    }),

    createOrganization: builder.mutation<BaseApiResponse<{ organization: Organization }>, CreateOrganizationRequest>({
      query: (data) => ({
        url: '/organizations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Organization'],
    }),

    updateOrganization: builder.mutation<BaseApiResponse<{ organization: Organization }>, { id: string; data: UpdateOrganizationRequest }>({
      query: ({ id, data }) => ({
        url: `/organizations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Organization', id }, 'Organization'],
    }),

    deleteOrganization: builder.mutation<BaseApiResponse<void>, string>({
      query: (id) => ({
        url: `/organizations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Organization', id }, 'Organization'],
    }),

    getOrganizationMembers: builder.query<BaseApiResponse<User[]>, { id: string; params?: { page?: number; limit?: number; role?: string } }>({
      query: ({ id, params }) => ({
        url: `/organizations/${id}/members`,
        params,
      }),
      providesTags: (result, error, { id }) => [
        { type: 'Organization', id: `${id}-members` },
        'User'
      ],
    }),

    addOrganizationMember: builder.mutation<BaseApiResponse<{ message: string }>, { id: string; data: AddMemberRequest }>({
      query: ({ id, data }) => ({
        url: `/organizations/${id}/members`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Organization', id: `${id}-members` },
        { type: 'Organization', id },
        'User'
      ],
    }),

    removeOrganizationMember: builder.mutation<BaseApiResponse<{ message: string }>, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/organizations/${id}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Organization', id: `${id}-members` },
        { type: 'Organization', id },
        'User'
      ],
    }),

    getOrganizationCourses: builder.query<BaseApiResponse<Course[]>, { id: string; params?: { page?: number; limit?: number; status?: string } }>({
      query: ({ id, params }) => ({
        url: `/organizations/${id}/courses`,
        params,
      }),
      providesTags: (result, error, { id }) => [
        { type: 'Organization', id: `${id}-courses` },
        'Course'
      ],
    }),

    getOrganizationStats: builder.query<BaseApiResponse<OrganizationStats>, string>({
      query: (id) => `/organizations/${id}/stats`,
      providesTags: (result, error, id) => [{ type: 'Organization', id: `${id}-stats` }],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetOrganizationByIdQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useGetOrganizationMembersQuery,
  useAddOrganizationMemberMutation,
  useRemoveOrganizationMemberMutation,
  useGetOrganizationCoursesQuery,
  useGetOrganizationStatsQuery,
} = organizationApi;