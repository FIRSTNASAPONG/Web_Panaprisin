// Fields consumed by the UI from Laravel models and controller responses.
// Decimal columns may be serialized as strings; calculated totals are numbers.
export type Decimal = string | number;

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: 'buyer' | 'seller' | 'admin';
  name?: string; // Legacy display-name fallback used by the UI.
}

export interface Product {
  id: number;
  user_id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: Decimal;
  stock_quantity: number;
  image_url: string | null;
  // Optional legacy/display fields; current ProductController does not add these.
  image?: string | null;
  stock?: number;
  rating?: Decimal;
  reviews?: number;
  sold?: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  product_name?: string | null;
  product_id: number;
  quantity: number;
  subtotal: Decimal;
  // Seller responses flatten the product name and rename unit_price to price.
  name?: string | null;
  price?: Decimal;
  unit_price?: Decimal;
  product?: Product | null;
}

export interface Order {
  id: number;
  created_at: string | null;
  total_amount: Decimal;
  items: OrderItem[];
  // Admin receives the model; seller receives the filtered controller response.
  status?: OrderStatus;
  order_status?: OrderStatus;
  shipping_address?: string;
  user?: User | null;
}

export interface ApiCartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product | null;
}

export interface ApiCart {
  items?: ApiCartItem[];
}

export interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

// Preserve the response envelopes already supported by the frontend.
export type ProductListResponse = Product[] | { data?: Product[]; products?: Product[] };
export type OrderListResponse = Order[] | { data?: Order[] };

export interface Payment {
  payment_method: 'promptpay' | 'bank_transfer' | 'credit_card';
  payment_status: 'pending' | 'completed' | 'failed';
  amount: Decimal;
}
export interface BuyerOrder extends Order {
  order_status: OrderStatus;
  shipping_address: string;
  payment: Payment | null;
}
export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}
export interface AccountOverview {
  user: User;
  total_orders: number;
  pending_payment: number;
  shipping_orders: number;
  recent_orders: BuyerOrder[];
}
