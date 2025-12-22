import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexRead – AI-Powered Book Summaries",
  description: "AI-powered book summaries and insights to help you read smarter.",
  icons: {
    icon: "/icon.png",
  },
    openGraph: {
    title: "NexRead – AI-Powered Book Summaries",
    description:
      "An AI-powered reading app providing book summaries and insights for faster learning.",
    url: "https://nexread.vercel.app",
    siteName: "NexRead",
    images: [
      {
        url: "https://nexread.vercel.app/og-nexread.png",
        width: 1200,
        height: 630,
        alt: "NexRead – AI-Powered Book Summaries",
      },
    ],
    type: "website",
  },
    twitter: {
    card: "summary_large_image",
    title: "NexRead – AI-Powered Book Summaries",
    description:
      "AI-powered book summaries and insights to help you read smarter.",
    images: ["https://nexread.vercel.app/og-nexread.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        <div style={{}}>{children}</div>
      </body>
    </html>
  );
}
