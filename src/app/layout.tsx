import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./landing.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Walleto - Giải pháp Quản lý Tài chính Thông minh",
  description: "Quản lý danh mục đầu tư crypto, theo dõi dòng tiền và nhận thông tin chi tiết từ AI với Walleto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased nice-scroll`}
      >
        <Providers>
          {children}
        </Providers >
      </body>
    </html >
  );
}
