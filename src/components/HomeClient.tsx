"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import ProgressBar from "@/components/ProgressBar";
import DonationForm from "@/components/DonationForm";
import DonorWall from "@/components/DonorWall";

interface Donor {
  name: string;
  amount: number;
  city?: string | null;
}

interface HomeClientProps {
  initial: {
    config: {
      mandalName: string;
      year: number;
      goalAmount: number;
      sthapanaDate: string;
      visarjanDate: string;
    };
    donors: Donor[];
    totalAmount: number;
    totalDonors: number;
  };
}

function useDaysUntil(dateStr: string): number {
  return useMemo(() => {
    const target = new Date(dateStr + "T00:00:00");
    const now = new Date();
    const diffMs = target.getTime() - new Date(now.toDateString()).getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [dateStr]);
}

export default function HomeClient({ initial }: HomeClientProps) {
  const { t } = useLanguage();
  const [totals, setTotals] = useState({
    totalAmount: initial.totalAmount,
    totalDonors: initial.totalDonors,
    donors: initial.donors,
  });

  const daysToSthapana = useDaysUntil(initial.config.sthapanaDate);
  const daysToVisarjan = useDaysUntil(initial.config.visarjanDate);

  // Refresh the live totals/donor wall periodically without a full page reload
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/donations/recent", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setTotals({
          totalAmount: data.totalAmount,
          totalDonors: data.totalDonors,
          donors: data.donors,
        });
      } catch {
        // Silently ignore - the initial server-rendered totals still show
      }
    };
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  const scrollToForm = () => {
    document.getElementById("donate")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const inFestivalWindow = daysToSthapana <= 0 && daysToVisarjan >= 0;

  return (
    <main>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 sm:px-8 py-4 bg-maroon-900/70 backdrop-blur-md border-b border-gold-700/30">
        <span className="font-display text-xl text-gold-300">{initial.config.mandalName}</span>
        <LanguageToggle />
      </header>

      {/* Hero */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-maroon-950">
        <Image
          src="/images/ganesh-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-maroon-950/85 via-maroon-950/60 to-maroon-950/90" />
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center px-6 pt-20">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="uppercase tracking-[0.2em] text-saffron-400 text-sm font-semibold mb-4"
          >
            {t("heroEyebrow")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl text-cream-50 leading-tight mb-5"
          >
            {t("heroTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-cream-100/80 text-lg mb-8 max-w-xl mx-auto"
          >
            {t("heroSubtitle")}
          </motion.p>

          {!inFestivalWindow && daysToSthapana > 0 && (
            <p className="mb-8 font-number text-gold-300 text-sm">
              {daysToSthapana} {t("days")}
            </p>
          )}

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            onClick={scrollToForm}
            className="rounded-full bg-gradient-to-r from-saffron-500 to-gold-500 px-10 py-4 font-display text-lg text-maroon-900 shadow-2xl shadow-saffron-900/40 hover:brightness-110 transition-all"
          >
            {t("heroCta")}
          </motion.button>

          <div className="mt-14">
            <ProgressBar
              total={totals.totalAmount}
              goal={initial.config.goalAmount}
              donorCount={totals.totalDonors}
            />
          </div>
        </div>
      </section>

      <div className="warli-divider bg-cream-50" />

      {/* Donation form */}
      <section id="donate" className="bg-cream-50 py-16 sm:py-24 px-5 sm:px-8">
        <div className="max-w-xl mx-auto">
          <DonationForm mandalName={initial.config.mandalName} />
        </div>
      </section>

      {/* Donor wall */}
      <DonorWall donors={totals.donors} />

      {/* Footer */}
      <footer className="bg-maroon-950 text-cream-200/60 text-center text-sm py-8 px-5">
        <p className="font-display text-gold-300 text-lg mb-1">{initial.config.mandalName}</p>
        <p>{t("footerNote")}</p>
        <p className="mt-3">
          <a href="/admin" className="underline underline-offset-2 hover:text-gold-300">
            Admin
          </a>
        </p>
        <p className="mt-4 text-xs text-cream-200/35">
          Hero photo:{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Ganpati_at_Pune.JPG"
            className="underline underline-offset-2 hover:text-gold-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Yoursamrut
          </a>
          , CC BY-SA 4.0, via Wikimedia Commons
        </p>
        <p className="mt-1 text-xs text-cream-200/35">
          Built by{" "}
          <a
            href="https://wa.me/919923608616?text=Hi"
            className="text-sm font-bold underline underline-offset-2 hover:text-gold-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Aadesh Gulumbe
          </a>
        </p>
      </footer>
    </main>
  );
}
