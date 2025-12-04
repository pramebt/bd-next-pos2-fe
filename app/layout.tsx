import type { Metadata } from "next";
import { Kanit } from "next/font/google";

import { Toaster } from "sonner";
import "./globals.css";

const kanit = Kanit({ 
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
});


export const metadata: Metadata = {
  title: "POS System",
  description: "Point of Sale System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={kanit.variable}>
      <body className={kanit.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}