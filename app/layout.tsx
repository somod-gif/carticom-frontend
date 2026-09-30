import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthGate } from "@/components/auth/AuthGate";
import { Analytics } from "@/components/analytics/Analytics";
import { APP_URL } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Carticom - Commerce Operating System for Africa",
  description: "Build, sell, manage and scale your business with Carticom. The all-in-one commerce platform for African businesses.",
  keywords: ["commerce", "africa", "ecommerce", "payments", "subscriptions", "ai", "business"],
  authors: [{ name: "Carticom" }],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"},
  openGraph: {
    title: "Carticom - Commerce Operating System for Africa",
    description: "Build, sell, manage and scale your business with Carticom.",
    type: "website",
    locale: "en_NG",
    url: APP_URL,
    siteName: "Carticom",
    images: [{
      url: `${APP_URL}/icon.svg`,
      width: 512,
      height: 512,
      alt: "Carticom"}]},
  twitter: {
    card: "summary_large_image",
    title: "Carticom - Commerce Operating System for Africa",
    description: "Build, sell, manage and scale your business with Carticom.",
    images: [`${APP_URL}/icon.svg`]}};

export default function RootLayout({
  children}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-NG"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            <AuthGate>
              {children}
            </AuthGate>
            <Analytics />
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
              theme="light"
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}