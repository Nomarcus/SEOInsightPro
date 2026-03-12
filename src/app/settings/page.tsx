"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Upload,
  X,
  Palette,
  User,
  MessageSquare,
  Eye,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import { useBranding } from "@/hooks/use-branding";

const ACCENT_PRESETS = [
  { color: "#3B82F6", label: "Blue" },
  { color: "#8B5CF6", label: "Purple" },
  { color: "#10B981", label: "Emerald" },
  { color: "#06B6D4", label: "Cyan" },
  { color: "#F59E0B", label: "Amber" },
  { color: "#EF4444", label: "Red" },
  { color: "#EC4899", label: "Pink" },
  { color: "#F97316", label: "Orange" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { branding, updateBranding, resetBranding } = useBranding();
  const [saved, setSaved] = useState(false);

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 500000) {
        alert("Logo must be under 500KB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBranding({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    },
    [updateBranding]
  );

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Branding Settings</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetBranding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border hover:border-border/80 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Logo */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Logo
              </h2>
              <div className="flex items-center gap-4">
                {branding.logoUrl ? (
                  <div className="relative">
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      className="w-20 h-20 rounded-xl object-contain border border-border bg-card"
                    />
                    <button
                      onClick={() => updateBranding({ logoUrl: null })}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
                <div className="text-xs text-muted-foreground">
                  <p>Upload your logo (PNG, JPG, SVG)</p>
                  <p>Max 500KB, will appear in reports & CTA</p>
                </div>
              </div>
            </motion.section>

            {/* Accent Color */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Accent Color
              </h2>
              <div className="flex flex-wrap gap-3">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => updateBranding({ accentColor: preset.color })}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${
                      branding.accentColor === preset.color
                        ? "border-white scale-110 shadow-lg"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.label}
                  />
                ))}
                <label className="relative">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) =>
                      updateBranding({ accentColor: e.target.value })
                    }
                    className="w-10 h-10 rounded-xl cursor-pointer border-2 border-dashed border-border"
                  />
                </label>
              </div>
            </motion.section>

            {/* Contact Info */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Contact Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={branding.consultantName}
                    onChange={(e) =>
                      updateBranding({ consultantName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={branding.companyName}
                    onChange={(e) =>
                      updateBranding({ companyName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary transition-colors"
                    placeholder="SEO Agency AB"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={branding.consultantEmail}
                    onChange={(e) =>
                      updateBranding({ consultantEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary transition-colors"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={branding.consultantPhone}
                    onChange={(e) =>
                      updateBranding({ consultantPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary transition-colors"
                    placeholder="+46 70 123 4567"
                  />
                </div>
              </div>
            </motion.section>

            {/* CTA Text */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Call-to-Action Text
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    CTA Headline
                  </label>
                  <input
                    type="text"
                    value={branding.ctaText}
                    onChange={(e) =>
                      updateBranding({ ctaText: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary transition-colors"
                    placeholder="Ready to Unlock Your Full Potential?"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    CTA Description
                  </label>
                  <textarea
                    value={branding.ctaDescription}
                    onChange={(e) =>
                      updateBranding({ ctaDescription: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Let our SEO experts help you..."
                  />
                </div>
              </div>
            </motion.section>
          </div>

          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-20 lg:self-start"
          >
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Live Preview
            </h2>
            <div className="rounded-xl border border-border/50 overflow-hidden">
              {/* Mini CTA preview */}
              <div className="relative p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-cyan-600/10" />
                <div className="relative text-center">
                  {branding.logoUrl && (
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      className="w-10 h-10 mx-auto mb-2 rounded-lg object-contain"
                    />
                  )}
                  <h3 className="text-sm font-semibold mb-1">
                    {branding.ctaText || "Your CTA Here"}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {branding.ctaDescription || "Your description here"}
                  </p>
                  <div
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: branding.accentColor }}
                  >
                    <Mail className="w-3 h-3" />
                    Get in Touch
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  {branding.consultantPhone && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {branding.consultantPhone}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {branding.consultantName}
                    {branding.companyName &&
                    branding.companyName !== "SEO Insight Pro"
                      ? ` — ${branding.companyName}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This preview shows how the CTA section will look at the bottom of
              every report.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
