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
  title: "Mentivo — An AI that teaches you to code",
  description:
    "Mentivo guides you through building real web projects — step by step, concept by concept — until you understand every line. Not another tutorial. A real coding mentor.",
  keywords: [
    "learn web development",
    "AI coding mentor",
    "learn to code",
    "build real projects",
    "web dev for beginners",
    "codecademy alternative",
  ],
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
        {children}
      </body>
    </html>
  );
}
