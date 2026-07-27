import { createResourceApiHooks } from '../helpers/createResourceApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';

export interface Category {
  id?: number;
  iiko_id: string;
  name_ru: string;
  name_uz: string;
  name_kaa: string;
  name_en: string;
  prep_minutes: number;
  order: number;
  is_active: boolean;
  products_count?: number;
}

export interface CategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

export interface CategoryBulkUpdate {
  id: number;
  order: number;
  is_active: boolean;
  prep_minutes: number;
}

const CATEGORY_URL = '/categories/';

export const {
  useGetResources: useGetCategories,
  useGetResource: useGetCategory,
  useCreateResource: useCreateCategory,
  useUpdateResource: useUpdateCategory,
  useDeleteResource: useDeleteCategory,
} = createResourceApiHooks<Category, CategoryResponse>(CATEGORY_URL, 'categories');

export const useBulkUpdateCategories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: CategoryBulkUpdate[]) => {
      const response = await api.post(`${CATEGORY_URL}bulk-update/`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useAllCategories = () => {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      let page = 1;
      let allResults: Category[] = [];
      let hasMore = true;

      while (hasMore) {
        const response = await api.get<CategoryResponse>(CATEGORY_URL, {
          params: { page, page_size: 100 },
        });
        allResults = [...allResults, ...response.data.results];
        hasMore = response.data.next !== null;
        page++;
      }

      return allResults;
    },
  });
};
