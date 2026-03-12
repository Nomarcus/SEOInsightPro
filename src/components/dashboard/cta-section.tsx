"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { useBranding } from "@/hooks/use-branding";

export function CTASection() {
  const { branding } = useBranding();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-primary/20">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

        <div className="relative p-8 md:p-12 text-center">
          {/* Logo */}
          {branding.logoUrl && (
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              className="w-16 h-16 mx-auto mb-4 rounded-lg object-contain"
            />
          )}

          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {branding.ctaText}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            {branding.ctaDescription}
          </p>

          {/* Contact info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {branding.consultantEmail && (
              <a
                href={`mailto:${branding.consultantEmail}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors group"
              >
                <Mail className="w-4 h-4" />
                Get in Touch
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
            {branding.consultantPhone && (
              <a
                href={`tel:${branding.consultantPhone}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {branding.consultantPhone}
              </a>
            )}
          </div>

          {/* Consultant name */}
          <p className="text-sm text-muted-foreground">
            {branding.consultantName}
            {branding.companyName && branding.companyName !== "SEO Insight Pro"
              ? ` — ${branding.companyName}`
              : ""}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
