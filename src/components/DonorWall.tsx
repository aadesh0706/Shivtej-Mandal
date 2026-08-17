"use client";

import { useLanguage } from "@/lib/i18n";

interface Donor {
  name: string;
  amount: number;
  city?: string | null;
}

export default function DonorWall({ donors }: { donors: Donor[] }) {
  const { t } = useLanguage();

  if (donors.length === 0) return null;

  // Duplicate the list so the CSS marquee loops seamlessly at -50%.
  const looped = [...donors, ...donors];

  return (
    <section className="py-10 bg-maroon-900">
      <h3 className="text-center font-display text-2xl text-gold-300 mb-6">
        {t("recentDonorsTitle")}
      </h3>
      <div className="relative overflow-hidden hide-scrollbar">
        <div className="flex w-max gap-4 animate-garland hover:[animation-play-state:paused]">
          {looped.map((d, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center gap-3 rounded-xl border border-gold-700/50 bg-maroon-800/60 px-4 py-3"
            >
              <span
                className="h-2.5 w-2.5 rounded-full bg-saffron-500 flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-cream-100 font-medium text-sm leading-tight">
                  {d.name}
                  {d.city ? (
                    <span className="text-cream-200/60 font-normal"> · {d.city}</span>
                  ) : null}
                </p>
                <p className="font-number text-gold-300 text-sm font-semibold">
                  ₹{d.amount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
