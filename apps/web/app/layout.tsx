import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
// GSAP plugins do not work as it is we need to register them
gsap.registerPlugin(ScrollTrigger, SplitText);
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
  title: "Heimdal Uptime Monitor",
  description: "Heimdal Uptime Monitor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
