import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "@/styles/globals.css";
import { appConfig } from "@/config/app";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
