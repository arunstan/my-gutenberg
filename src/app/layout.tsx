import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "./components/SessionProviderWrapper";
import AppBar from "./components/AppBar";

const APP_TITLE = "myGutenberg";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "Read and analyze Project Gutenberg books",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 dark:bg-gray-900`}
      >
        <SessionProviderWrapper>
          <AppBar />
          <main>{children}</main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
