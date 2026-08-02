import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Voucher {
  id?: number;
  product_name: string;
  purchaser_name: string | null;
  purchaser_phone: string;
  redeemed_by_name: string | null;
  status_display: string;
  source: string;
  face_value: string;
  sale_price: string;
  code: string;
  status: string;
  rahmat_invoice_id: string;
  rahmat_payment_url: string;
  rahmat_trans_id: string;
  iiko_transaction_id: string;
  redeem_attempts: number;
  purchased_at: string | null;
  expires_at: string | null;
  redeemed_at: string | null;
  cancelled_at: string | null;
  last_error: string;
  created_at: string;
  updated_at: string;
  product: number | null;
  purchaser: number | null;
  redeemed_by: number | null;
}

export interface VoucherResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Voucher[];
}

const VOUCHER_URL = '/vouchers/';

export const {
  useGetResources: useGetVouchers,
  useGetResource: useGetVoucher,
} = createResourceApiHooks<Voucher, VoucherResponse>(VOUCHER_URL, 'vouchers');
