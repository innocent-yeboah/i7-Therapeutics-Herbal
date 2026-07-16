export type ConsultationStatus =
  | "pending"
  | "reviewed"
  | "recommendation_sent"
  | "booking_confirmed"
  | "completed"
  | "cancelled";

export type PreferredContact = "whatsapp" | "call" | "email";

export type TherapyCategory =
  | "massage"
  | "cupping"
  | "sports"
  | "recovery"
  | "lymphatic"
  | "meridian"
  | "deep_tissue"
  | "herbal"
  | "other";

export type TherapyServiceRow = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  category: TherapyCategory | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ConsultationRequestRow = {
  id: string;
  created_at: string;
  user_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  preferred_contact: PreferredContact;
  preferred_date: string | null;
  preferred_time: string | null;
  condition_description: string;
  symptoms: string | null;
  duration_of_condition: string | null;
  previous_treatments: string | null;
  current_medications: string | null;
  allergies: string | null;
  desired_outcome: string | null;
  additional_notes: string | null;
  status: ConsultationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  recommended_therapies: string[] | null;
  recommended_duration: string | null;
  recommended_price: number | null;
  recommendation_notes: string | null;
  recommendation_sent_at: string | null;
  confirmed_therapy: string | null;
  confirmed_duration: string | null;
  confirmed_price: number | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  booking_confirmed_at: string | null;
  completed_at: string | null;
  feedback: string | null;
  rating: number | null;
  admin_notes: string | null;
};

export type UserRow = {
  id: string;
  email: string;
  name: string;
  phone: string;
  is_admin: boolean;
  is_practitioner?: boolean;
  specialization?: string | null;
  created_at: string;
};

export type ServiceRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  image: string | null;
  slug: string | null;
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
