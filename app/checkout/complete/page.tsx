import Link from "next/link";
import { verifyCheckoutComplete } from "@/app/actions/checkout";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";

export const metadata = {
  title: "Payment complete",
};

function Success({ orderId }: { orderId: string }) {
  return (
    <>
      <ClearCartOnMount />
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-[var(--primary)]">Thank you!</h1>
        <p className="mt-3 text-[var(--muted)]">
          Your payment was verified and your order is confirmed. Your order ID is{" "}
          <span className="font-mono text-sm text-[var(--text)]">{orderId}</span>.
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          You can sign in anytime to view receipts and order status — no need to stay on this page.
        </p>
        <Link
          href="/account"
          className="mt-8 inline-block rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white"
        >
          View my orders
        </Link>
      </div>
    </>
  );
}

function Pending({ reference }: { reference: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-serif text-3xl text-[var(--secondary)]">Almost there</h1>
      <p className="mt-3 text-[var(--muted)]">
        We could not confirm your payment instantly. If you completed checkout on Paystack, it may still be
        processing, or your session timed out — that does not cancel the payment.
      </p>
      <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Please check your email for a receipt, or sign in and open <strong>Account → Orders</strong>. If the charge
        appears on your statement, we will match it to your order shortly.
      </p>
      <p className="mt-4 font-mono text-xs text-[var(--muted)]">Reference: {reference}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/account" className="inline-block rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white">
          Go to account
        </Link>
        <Link href="/contact" className="text-sm font-semibold text-[var(--secondary)] underline">
          Contact us
        </Link>
      </div>
    </div>
  );
}

function Fail({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-serif text-3xl text-red-600">Payment issue</h1>
      <p className="mt-3 text-[var(--muted)]">{message}</p>
      <Link href="/cart" className="mt-8 inline-block font-semibold text-[var(--primary)]">
        Return to cart
      </Link>
    </div>
  );
}

export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams?: Promise<{ reference?: string; trxref?: string }> | { reference?: string; trxref?: string };
}) {
  const sp = searchParams instanceof Promise ? await searchParams : searchParams;
  const reference = sp?.reference || sp?.trxref;
  if (!reference) {
    return <Fail message="Missing payment reference from Paystack." />;
  }

  const result = await verifyCheckoutComplete(reference);

  if (result.ok && result.variant === "success") {
    return <Success orderId={result.orderId} />;
  }

  if (!result.ok && result.variant === "pending") {
    return <Pending reference={reference} />;
  }

  if (!result.ok && result.variant === "invalid") {
    return <Fail message={result.error} />;
  }

  if (!result.ok) {
    return <Fail message={"error" in result ? result.error : "Something went wrong."} />;
  }

  return <Fail message="Unexpected response." />;
}
