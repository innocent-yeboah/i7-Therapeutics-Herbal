import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart/cart-context";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";
import { StorefrontChrome } from "@/components/storefront-chrome";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`,
  },
  description: `${BRAND.tagline} · ${BRAND.location}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white font-sans text-[var(--text)] antialiased">
        <CartProvider>
          <StorefrontChrome
            header={<SiteHeader />}
            footer={<SiteFooter />}
            floating={<FloatingWhatsAppButton />}
          >
            {children}
          </StorefrontChrome>
        </CartProvider>
      </body>
    </html>
  );
}
