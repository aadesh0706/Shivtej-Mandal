"use client";

import { useLanguage } from "@/lib/i18n";

interface ProgressBarProps {
  total: number;
  goal: number;
  donorCount: number;
}

export default function ProgressBar({ total, goal, donorCount }: ProgressBarProps) {
  const { t } = useLanguage();
  const pct = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-cream-200/70">{t("goalLabel")}</p>
          <p className="font-number font-semibold text-2xl text-gold-300">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-cream-200/70">
            {donorCount} {t("donorsLabel")}
          </p>
          <p className="text-sm text-cream-200/80">
            {t("goalOf")} ₹{goal.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
      <div className="h-3 w-full rounded-full bg-maroon-900/60 border border-gold-700/40 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-saffron-500 via-gold-500 to-gold-300 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
