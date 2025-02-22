import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Next.js Multi-Image Upload",
    template: "%s | Next.js Multi-Image Upload",
  },
  description:
    "A reusable multi-image upload component for Next.js with TypeScript, Tailwind CSS, and react-hook-form. Upload, preview, and delete images with ease.",
  keywords: [
    "Next.js",
    "multi-image upload",
    "TypeScript",
    "Tailwind CSS",
    "react-hook-form",
    "shadcn/ui",
    "image upload",
  ],
  authors: [{ name: "jacksonkasi0", url: "https://github.com/jacksonkasi0" }],
  creator: "jacksonkasi0",
  publisher: "jacksonkasi0",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Next.js Multi-Image Upload",
    description:
      "Easily upload multiple images with a responsive, type-safe component built for Next.js.",
    url: "https://github.com/jacksonkasi0/nextjs-multi-image-upload",
    siteName: "Next.js Multi-Image Upload",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Next.js Multi-Image Upload Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js Multi-Image Upload",
    description:
      "A reusable multi-image upload component for Next.js with TypeScript and Tailwind CSS.",
    creator: "@jacksonkasi11",
    images: ["/og-image.png"],
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}