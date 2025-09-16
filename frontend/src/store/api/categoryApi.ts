import { baseApi } from './baseApi';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  color?: string;
  parentCategory?: string;
  isActive: boolean;
  courseCount?: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategory?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategory?: string;
  isActive?: boolean;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  includeStats?: boolean;
  includeSubcategories?: boolean;
}

export interface CategoryResponse {
  success: boolean;
  data: Category[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CategoryStatsResponse {
  success: boolean;
  data: (Category & { courseCount: number })[];
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    getCategories: builder.query<CategoryResponse, CategoryQueryParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
        if (params.includeStats) searchParams.append('includeStats', params.includeStats.toString());
        if (params.includeSubcategories) searchParams.append('includeSubcategories', params.includeSubcategories.toString());

        return {
          url: `categories?${searchParams.toString()}`,
        };
      },
      providesTags: ['Categories'],
    }),

    // Get category by ID
    getCategoryById: builder.query<{ success: boolean; data: Category }, string>({
      query: (id) => ({
        url: `categories/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Get category stats
    getCategoryStats: builder.query<CategoryStatsResponse, void>({
      query: () => ({
        url: 'categories/stats',
      }),
      providesTags: ['Categories'],
    }),

    // Create new category
    createCategory: builder.mutation<{ success: boolean; message: string; data: Category }, CreateCategoryRequest>({
      query: (categoryData) => ({
        url: 'categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Categories'],
    }),

    // Update category
    updateCategory: builder.mutation<{ success: boolean; message: string; data: Category }, { id: string; data: UpdateCategoryRequest }>({
      query: ({ id, data }) => ({
        url: `categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Categories',
        { type: 'Category', id }
      ],
    }),

    // Delete category
    deleteCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryStatsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;

// Export category utilities
export const getCategoryOptions = (categories: Category[]) => {
  return categories
    .filter(category => category.isActive)
    .map(category => ({
      value: category.name,
      label: category.name,
      _id: category._id
    }));
};

export const getCategorySelectOptions = (categories: Category[]) => {
  return categories
    .filter(category => category.isActive)
    .map(category => ({
      value: category._id,
      label: category.name,
      icon: category.icon,
      color: category.color
    }));
};