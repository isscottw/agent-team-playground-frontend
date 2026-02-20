import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApiKeyProvider } from "@/contexts/ApiKeyContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Agent Team Playground",
  description: "Visual agent team builder and runner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-bg text-fg`}>
        <AuthProvider>
          <ApiKeyProvider>
            {children}
          </ApiKeyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
