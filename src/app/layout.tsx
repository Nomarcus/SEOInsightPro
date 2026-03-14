import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { AnalysisProvider } from "@/hooks/use-analysis";
import { BrandingProvider } from "@/hooks/use-branding";
import { AuthProvider } from "@/hooks/use-auth";
import { PageTracker } from "@/components/analytics/page-tracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://seo-insight-pro-indol.vercel.app";

export const metadata: Metadata = {
  title: "AI SEO Analysis Tool | SEO Insight Pro - Boost Your Search Rankings",
  description:
    "Unlock your website's hidden SEO potential with AI-powered analysis. Get actionable insights, Core Web Vitals scores, keyword strategies and step-by-step fix guides in 30 seconds. Free analysis — no signup required.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "SEO Insight Pro", url: siteUrl }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "SEO Insight Pro",
    title: "AI SEO Analysis Tool | SEO Insight Pro",
    description:
      "Unlock your website's hidden SEO potential with AI-powered analysis. Get actionable insights in 30 seconds.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SEO Insight Pro - AI-Powered SEO Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI SEO Analysis Tool | SEO Insight Pro",
    description:
      "Unlock your website's hidden SEO potential with AI-powered analysis. Get actionable insights in 30 seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SEO Insight Pro",
              url: siteUrl,
              logo: `${siteUrl}/favicon.ico`,
              description:
                "AI-powered SEO analysis tool that helps businesses improve their search engine rankings with actionable insights.",
              sameAs: [],
              foundingDate: "2026",
              knowsAbout: [
                "Search Engine Optimization",
                "SEO Analysis",
                "Core Web Vitals",
                "AI-Powered SEO",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "SEO Insight Pro",
              url: siteUrl,
              applicationCategory: "SEO Tool",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free SEO analysis — no signup required",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is SEO Insight Pro?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "SEO Insight Pro is an AI-powered SEO analysis tool that scans your website and provides actionable insights to improve search engine rankings. It analyzes meta tags, content quality, Core Web Vitals, and keyword strategy.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does AI-powered SEO analysis work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Our tool uses multiple AI models to analyze your website content, structure, and performance. It then generates personalized recommendations with step-by-step fix guides.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is SEO Insight Pro free to use?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, you can run a free SEO analysis without signing up. Additional analyses and premium features like detailed PDF reports are available with credits.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <BrandingProvider>
              <AnalysisProvider>
                <PageTracker />
                {children}
              </AnalysisProvider>
            </BrandingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
