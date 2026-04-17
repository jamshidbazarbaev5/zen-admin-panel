import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface OrderItemModifier {
  id: number;
  modifier: number;
  modifier_name: string;
  quantity: number;
  price: string;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  price: string;
  subtotal: string;
  modifiers: OrderItemModifier[];
}

export interface Order {
  id?: number;
  customer_name: string;
  customer_phone: string;
  pickup_location_name: string | null;
  items_count?: number;
  items?: OrderItem[];
  should_cook: boolean;
  is_overdue: boolean;
  number: string;
  status: 'pending' | 'paid' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  order_type: 'pickup' | 'delivery';
  delivery_address: string;
  delivery_flat: string;
  delivery_entrance: string;
  delivery_floor: string;
  delivery_comment: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  total_amount: string;
  balance_used: string;
  online_paid: string;
  pickup_time: string;
  prep_minutes: number;
  iiko_order_id: string | null;
  iiko_order_number: string;
  iiko_correlation_id: string | null;
  iiko_response: any;
  cancel_reason: string;
  bot_message_id: string | null;
  created_at: string;
  updated_at: string;
  customer: number;
  pickup_location: number | null;
}

export interface OrderResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

const ORDER_URL = '/orders/';

export const {
  useGetResources: useGetOrders,
  useGetResource: useGetOrder,
  useCreateResource: useCreateOrder,
  useUpdateResource: useUpdateOrder,
  useDeleteResource: useDeleteOrder,
} = createResourceApiHooks<Order, OrderResponse>(ORDER_URL, 'orders');
