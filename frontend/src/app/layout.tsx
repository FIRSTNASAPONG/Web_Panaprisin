import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// @ts-expect-error Next.js handles global CSS imports for the app router.
import "./globals.css";
import { CartProvider } from "../context/CartContext"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "พณาไพรสิน | ของสะสม & ของเก่าโบราณ",
  description: "ศูนย์รวมของเก่า ของสะสม เฟอร์นิเจอร์ไม้เก่า เครื่องเบญจรงค์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 2. ห่อหุ้มทั้งแอปด้วย CartProvider */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}