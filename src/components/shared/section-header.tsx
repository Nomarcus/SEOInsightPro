"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
}

export function SectionHeader({ title, subtitle, icon, badge }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div className="flex items-center gap-3 mb-1">
        {icon && <div className="text-primary">{icon}</div>}
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded
                           bg-violet-500/20 text-violet-400 uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground ml-0">{subtitle}</p>
      )}
    </motion.div>
  );
}
