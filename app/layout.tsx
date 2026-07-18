import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/cart/cart-provider";
import { LocaleProvider } from "@/components/layout/locale-provider";
import { PwaRegister } from "@/components/layout/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "AR Menu Platform",
  description: "Customer-facing QR menu MVP with bilingual browsing, cart, and AR-ready dish viewing.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "AR Menu",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFDF8",
};

const previewBuildSha = process.env.NEXT_PUBLIC_PREVIEW_BUILD_SHA;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased">
      <body className="min-h-full bg-background text-primary">
        <LocaleProvider>
          <CartProvider>
            <PwaRegister />
            {children}
            {previewBuildSha ? (
              <div className="px-4 pb-4 text-center text-[11px] font-bold text-muted/70">
                Preview build: {previewBuildSha.slice(0, 7)}
              </div>
            ) : null}
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
