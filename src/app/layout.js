"use client";

import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from "./provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>TGR Server</title>
      </head>
      <body className="bg-white dark:bg-gray-700 text-black dark:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
