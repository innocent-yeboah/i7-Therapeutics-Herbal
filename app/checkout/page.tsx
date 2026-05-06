import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { CheckoutClient } from "./checkout-client";

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user?.email) {
    redirect(`/account/login?next=${encodeURIComponent("/checkout")}`);
  }

  return <CheckoutClient email={user.email} />;
}
