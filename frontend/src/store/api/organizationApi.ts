import { baseApi, BaseApiResponse } from './baseApi';
import { Organization as BackendOrganization, User } from '../../types/backend-models';
import type { CoursePopulated } from './courseApi';

// Use backend organization type with computed fields for API
export interface OrganizationPopulated extends BackendOrganization {
  memberCount?: number; // Computed field
  coursesCount?: number; // Computed field
}

export interface CreateOrganizationRequest {
  name: string;
  email: string;
  type: 'educational_institution' | 'corporate' | 'government' | 'non_profit' | 'other';
  description?: string;
  logo?: string;
  website?: string;
  address?: BackendOrganization['address'];
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
  };
  settings?: Partial<BackendOrganization['settings']>;
}

export interface UpdateOrganizationRequest {
  name?: string;
  email?: string;
  description?: string;
  logo?: string;
  website?: string;
  address?: BackendOrganization['address'];
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
  };
  settings?: Partial<BackendOrganization['settings']>;
  isActive?: boolean;
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
  role: User['role'];
}

export interface OrganizationStats {
  totalMembers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeInstructors: number;
  coursesThisMonth: number;
  enrollmentsThisMonth: number;
  membersByRole: {
    [key: string]: number;
  };
  coursesByStatus: {
    [key: string]: number;
  };
}

export const organizationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<BaseApiResponse<OrganizationPopulated[]>, OrganizationListParams | void>({
      query: (params) => ({
        url: '/organizations',
        params: params || {},
      }),
      providesTags: ['Organization'],
    }),

    getOrganizationById: builder.query<BaseApiResponse<{ organization: OrganizationPopulated }>, string>({
      query: (id) => `/organizations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Organization', id }],
    }),

    createOrganization: builder.mutation<BaseApiResponse<{ organization: OrganizationPopulated }>, CreateOrganizationRequest>({
      query: (data) => ({
        url: '/organizations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Organization'],
    }),

    updateOrganization: builder.mutation<BaseApiResponse<{ organization: OrganizationPopulated }>, { id: string; data: UpdateOrganizationRequest }>({
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

    getOrganizationCourses: builder.query<BaseApiResponse<CoursePopulated[]>, { id: string; params?: { page?: number; limit?: number; status?: string } }>({
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