import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface VoucherProduct {
  id?: number;
  name: string;
  face_value: string;
  sale_price: string;
  validity_days: number | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VoucherProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: VoucherProduct[];
}

const VOUCHER_PRODUCT_URL = '/voucher-products/';

export const {
  useGetResources: useGetVoucherProducts,
  useGetResource: useGetVoucherProduct,
  useCreateResource: useCreateVoucherProduct,
  useUpdateResource: useUpdateVoucherProduct,
  useDeleteResource: useDeleteVoucherProduct,
} = createResourceApiHooks<VoucherProduct, VoucherProductResponse>(VOUCHER_PRODUCT_URL, 'voucher-products');
