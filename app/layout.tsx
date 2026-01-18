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
