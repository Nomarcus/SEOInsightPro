"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function BuyPage() {
  const router = useRouter();
  const { user, credits } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Login Required</h1>
          <p className="text-muted-foreground">
            You must be logged in to purchase credits.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const handlePayPalClick = async () => {
    setLoading(true);
    setError("");

    try {
      // Create PayPal order
      const response = await fetch("/api/payments/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: "SEK", amount: "199.00" }),
      });

      const data = await response.json();
      if (!data.approvalUrl) throw new Error(data.error || "Failed to create order");

      // Redirect to PayPal
      window.location.href = data.approvalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "PayPal error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold">Get More Analyses</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          {/* Current Credits */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Your current balance</p>
            <p className="text-5xl font-bold text-primary">{credits}</p>
            <p className="text-sm text-muted-foreground">analyses remaining</p>
          </div>

          {/* Package */}
          <div className="p-8 rounded-xl border-2 border-primary/50 bg-primary/5 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">5 Website Analyses</h2>
              <p className="text-muted-foreground">
                Get 5 premium SEO analyses with detailed insights
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[
                "Full technical SEO audit",
                "Performance & Core Web Vitals",
                "AI-powered insights",
                "Actionable recommendations",
                "PDF export",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-5xl font-bold">199 SEK</p>
                <p className="text-muted-foreground">€19.00</p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Payment Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePayPalClick}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#0070BA] hover:bg-[#005ea6] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white transition-all"
                >
                  {loading ? "Processing..." : "Pay with PayPal"}
                </button>

                <button
                  disabled
                  className="w-full py-3 rounded-lg bg-muted hover:bg-muted/80 font-medium text-muted-foreground disabled:opacity-50 cursor-not-allowed"
                  title="Swish integration coming soon"
                >
                  Pay with Swish (Coming Soon)
                </button>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-4 pt-8 border-t border-border/50">
            <h3 className="font-bold text-lg">Questions?</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">
                  When do I get my credits?
                </p>
                <p>Instantly after payment completion.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  Can I refund?
                </p>
                <p>
                  Contact support within 48 hours for a refund. We keep our
                  policies simple.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  Can I buy more?
                </p>
                <p>Yes, you can purchase multiple packages anytime.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
