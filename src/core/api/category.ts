import { createResourceApiHooks } from '../helpers/createResourceApi';

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

const CATEGORY_URL = '/categories/';

export const {
  useGetResources: useGetCategories,
  useGetResource: useGetCategory,
  useCreateResource: useCreateCategory,
  useUpdateResource: useUpdateCategory,
  useDeleteResource: useDeleteCategory,
} = createResourceApiHooks<Category, CategoryResponse>(CATEGORY_URL, 'categories');
