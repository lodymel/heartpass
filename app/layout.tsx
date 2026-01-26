import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import AppLayout from "@/components/AppLayout";
import ChatBot from "@/components/ChatBot";

// Inter - sans-serif used by Margot Priolet
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HeartPass - A personalized coupon card with your heart",
  description: "Create action-based digital coupon cards for friends, partners, or family. Personalized, shareable, and powered by AI.",
  keywords: ["coupon", "gift card", "love", "heartpass", "digital coupon", "personalized gift", "couples", "friends", "family"],
  authors: [{ name: "HeartPass" }],
  creator: "HeartPass",
  publisher: "HeartPass",
  metadataBase: new URL("https://heartpass.net"),
  alternates: {
    canonical: "https://heartpass.net",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://heartpass.net",
    siteName: "HeartPass",
    title: "HeartPass - A personalized coupon card with your heart",
    description: "Create action-based digital coupon cards for friends, partners, or family. Personalized, shareable, and powered by AI.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HeartPass - Share love with personalized coupons",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HeartPass - A personalized coupon card with your heart",
    description: "Create action-based digital coupon cards for friends, partners, or family. Personalized, shareable, and powered by AI.",
    images: ["/og-image.png"],
    creator: "@heartpass",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "xy8T_eAoYMoYlige2UPmB6TAorNnNCzA8um3MFRJPhU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <CustomCursor />
        <AppLayout>{children}</AppLayout>
        <ChatBot />
      </body>
    </html>
  );
}
