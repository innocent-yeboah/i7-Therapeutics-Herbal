import { fulfillOrderFromPaystack } from "@/lib/orders/fulfill";
import { verifyPaystackSignature } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function logPaystackWebhookFailure(params: {
  eventType: string;
  reference: string | null;
  payload: unknown;
  errorMessage: string;
}) {
  try {
    const admin = createServiceClient();
    await admin.from("webhook_failures").insert({
      event_type: params.eventType,
      reference: params.reference,
      payload: JSON.parse(JSON.stringify(params.payload)) as Record<string, unknown>,
      error_message: params.errorMessage.slice(0, 2000),
    });
  } catch (e) {
    console.error("logPaystackWebhookFailure", e);
  }
}

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY is not configured");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyPaystackSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const ref = event.data.reference;
    try {
      const result = await fulfillOrderFromPaystack(ref);
      if (!result.ok) {
        console.error("Paystack fulfill failed", ref, result.error);
        await logPaystackWebhookFailure({
          eventType: event.event ?? "charge.success",
          reference: ref,
          payload: event,
          errorMessage: result.error,
        });
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Paystack webhook fulfill exception", ref, e);
      await logPaystackWebhookFailure({
        eventType: event.event ?? "charge.success",
        reference: ref,
        payload: event,
        errorMessage: msg,
      });
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
