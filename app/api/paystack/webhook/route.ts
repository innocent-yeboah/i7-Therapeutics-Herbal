import { fulfillOrderFromPaystack } from "@/lib/orders/fulfill";
import { verifyPaystackSignature } from "@/lib/paystack";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
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
    const result = await fulfillOrderFromPaystack(event.data.reference);
    if (!result.ok) {
      return NextResponse.json({ received: true, fulfill: result.error }, { status: 200 });
    }
  }

  return NextResponse.json({ received: true });
}
