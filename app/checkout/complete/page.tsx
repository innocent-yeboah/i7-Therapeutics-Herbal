import Link from "next/link";
import { finalizePaidOrder } from "@/app/actions/checkout";
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
  searchParams?: { reference?: string; trxref?: string };
}) {
  const reference = searchParams?.reference || searchParams?.trxref;
  if (!reference) {
    return <Fail message="Missing payment reference from Paystack." />;
  }

  const result = await finalizePaidOrder(reference);
  if (!result.ok) {
    return <Fail message={result.error} />;
  }

  return <Success orderId={result.orderId} />;
}
