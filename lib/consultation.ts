import { z } from "zod";
import type { ConsultationStatus } from "@/lib/types/database";

export const consultationStatuses: ConsultationStatus[] = [
  "pending",
  "reviewed",
  "recommendation_sent",
  "booking_confirmed",
  "completed",
  "cancelled",
];

export const consultationStatusLabels: Record<ConsultationStatus, string> = {
  pending: "Pending review",
  reviewed: "Reviewed",
  recommendation_sent: "Recommendation sent",
  booking_confirmed: "Booking confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const consultationCreateSchema = z.object({
  client_name: z.string().trim().min(2, "Full name is required").max(120),
  client_email: z.string().trim().email("Valid email required").max(200),
  client_phone: z.string().trim().min(7, "Phone number is required").max(40),
  preferred_contact: z.enum(["whatsapp", "call", "email"]),
  preferred_date: z.string().optional().nullable(),
  preferred_time: z.string().optional().nullable(),
  condition_description: z
    .string()
    .trim()
    .min(20, "Please describe your condition in a bit more detail")
    .max(4000),
  symptoms: z.string().trim().max(2000).optional().nullable(),
  duration_of_condition: z.string().trim().max(200).optional().nullable(),
  previous_treatments: z.string().trim().max(2000).optional().nullable(),
  current_medications: z.string().trim().max(2000).optional().nullable(),
  allergies: z.string().trim().max(1000).optional().nullable(),
  desired_outcome: z.string().trim().max(2000).optional().nullable(),
  additional_notes: z.string().trim().max(2000).optional().nullable(),
});

export type ConsultationCreateInput = z.infer<typeof consultationCreateSchema>;

export const recommendationSchema = z.object({
  recommended_therapies: z.array(z.string().min(1)).min(1, "Select at least one therapy"),
  recommended_duration: z.string().trim().min(1, "Duration is required").max(120),
  recommended_price: z.coerce.number().positive("Price must be greater than zero"),
  recommendation_notes: z.string().trim().max(4000).optional().nullable(),
});

export type RecommendationInput = z.infer<typeof recommendationSchema>;

export const bookingConfirmSchema = z.object({
  confirmed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date"),
  confirmed_time: z.string().trim().min(1, "Choose a time"),
  client_email: z.string().trim().email().optional(),
});

export type BookingConfirmInput = z.infer<typeof bookingConfirmSchema>;

export function appSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://i7therapeuticsherbal.com";
}
