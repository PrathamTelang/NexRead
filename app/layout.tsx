import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://nexread.vercel.app"), // ⭐ REQUIRED FOR LINKEDIN

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
        url: "/og-nexread.png", // ✅ relative is OK when metadataBase is set
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
    images: ["/og-nexread.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
