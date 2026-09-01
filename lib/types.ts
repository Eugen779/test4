export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  cost_price: number | null;
  compare_at_price: number | null;
  stock: number;
  unit: string;
  size: string | null;
  weight_note: string | null;
  weight_options: number[] | null;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
};

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  button_text: string;
  button_link: string;
  display_order: number;
  is_active: boolean;
};

export type Settings = {
  id: number;
  store_name: string;
  tagline: string | null;
  logo_url: string | null;
  primary_color: string;
  currency: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  min_order_enabled: boolean;
  min_order_amount: number;
};

export type OrderStatus = "noua" | "confirmata" | "in_livrare" | "livrata" | "anulata";

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  status: OrderStatus;
  total: number;
  notes: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
};
