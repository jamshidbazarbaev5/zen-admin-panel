import { createResourceApiHooks } from '../helpers/createResourceApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

export interface Product {
  id?: number;
  category: number;
  category_name?: string;
  iiko_id: string;
  name_ru: string;
  name_uz: string;
  name_kaa: string;
  name_en: string;
  desc_ru: string;
  desc_uz: string;
  desc_kaa: string;
  desc_en: string;
  price: string;
  iiko_image_url: string;
  image: File | string | null;
  is_available: boolean;
  prep_minutes: number | null;
  order: number;
}

export interface ProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface ProductBulkUpdate {
  id: number;
  order: number;
  is_available: boolean;
  prep_minutes: number;
}

const PRODUCT_URL = '/products/';

export const {
  useGetResources: useGetProducts,
  useGetResource: useGetProduct,
  useCreateResource: useCreateProduct,
  useUpdateResource: useUpdateProduct,
  useDeleteResource: useDeleteProduct,
} = createResourceApiHooks<Product, ProductResponse>(PRODUCT_URL, 'products');

export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: ProductBulkUpdate[]) => {
      const response = await api.post(`${PRODUCT_URL}bulk-update/`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
