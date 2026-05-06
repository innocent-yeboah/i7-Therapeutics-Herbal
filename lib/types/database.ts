export type UserRow = {
  id: string;
  email: string;
  name: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
};

export type ServiceRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  image: string | null;
  created_at: string;
};

export type AppointmentRow = {
  id: string;
  user_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  reminder_sent_at: string | null;
  created_at: string;
};

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image: string | null;
  created_at: string;
};

export type OrderRow = {
  id: string;
  user_id: string;
  total_amount: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  paystack_reference: string | null;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
};

export type TestimonialRow = {
  id: string;
  client_name: string;
  content: string;
  rating: number;
  approved: boolean;
  created_at: string;
};

export type CartLine = {
  product: ProductRow;
  quantity: number;
};
