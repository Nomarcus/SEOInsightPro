import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { AnalysisProvider } from "@/hooks/use-analysis";
import { BrandingProvider } from "@/hooks/use-branding";
import { AuthProvider } from "@/hooks/use-auth";
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
  title: "SEO Insight Pro - AI-Powered SEO Analysis",
  description:
    "Discover your website's hidden SEO potential with AI-powered analysis. Get actionable insights in 30 seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <BrandingProvider>
              <AnalysisProvider>{children}</AnalysisProvider>
            </BrandingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
