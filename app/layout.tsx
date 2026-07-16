import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-provider";
import { LocaleProvider } from "@/components/layout/locale-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-primary">
        <LocaleProvider>
          <CartProvider>{children}</CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
