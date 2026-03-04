import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FundPRD AI - 公募基金智能 PRD 生成器",
  description: "专为公募基金产品经理打造的智能 PRD 生成助手，支持多模型 AI、内置基金业务知识库",
  keywords: ["公募基金", "PRD", "产品经理", "AI", "金融科技", "TA系统", "FA系统"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#0a0a0f] text-slate-200`}
      >
        {children}
      </body>
    </html>
  );
}
