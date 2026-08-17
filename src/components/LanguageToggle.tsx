"use client";

import { useLanguage } from "@/lib/i18n";
import clsx from "clsx";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language / भाषा"
      className="inline-flex items-center rounded-full border border-gold-300/60 bg-cream-50/10 p-1 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={() => setLang("mr")}
        aria-pressed={lang === "mr"}
        className={clsx(
          "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
          lang === "mr" ? "bg-gold-500 text-maroon-900" : "text-cream-100 hover:text-gold-300"
        )}
      >
        मराठी
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={clsx(
          "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
          lang === "en" ? "bg-gold-500 text-maroon-900" : "text-cream-100 hover:text-gold-300"
        )}
      >
        English
      </button>
    </div>
  );
}
