"use client";

import { useState, FormEvent } from "react";
import clsx from "clsx";
import { useLanguage } from "@/lib/i18n";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

const PRESET_AMOUNTS = [51, 101, 251, 501, 1001];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-checkout-js")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface DonationFormProps {
  mandalName: string;
  onAmountChange?: (amount: number) => void;
}

type Step = "form" | "success";

export default function DonationForm({ mandalName, onAmountChange }: DonationFormProps) {
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(101);
  const [customAmount, setCustomAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedDonationId, setCompletedDonationId] = useState<string | null>(null);

  const amount = selectedPreset ?? Number(customAmount) ?? 0;

  const handlePresetClick = (val: number) => {
    setSelectedPreset(val);
    setCustomAmount("");
    onAmountChange?.(val);
  };

  const handleCustomAmountChange = (val: string) => {
    const digitsOnly = val.replace(/[^0-9]/g, "");
    setCustomAmount(digitsOnly);
    setSelectedPreset(null);
    onAmountChange?.(Number(digitsOnly) || 0);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim() || !amount) {
      setError(t("errorRequiredFields"));
      return;
    }
    if (amount < 51) {
      setError(t("errorMinAmount"));
      return;
    }

    setProcessing(true);

    try {
      const orderRes = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          message: message.trim() || undefined,
          amount,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error ?? "Failed to create order");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay checkout");
      }

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: mandalName,
        description: "Ganeshotsav Vargani",
        prefill: { name: name.trim(), contact: phone.trim(), email: email.trim() },
        theme: { color: "#6B1420" },
        handler: async (response: unknown) => {
          const r = response as {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          };
          try {
            const verifyRes = await fetch("/api/donations/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                donationId: orderData.donationId,
                razorpay_order_id: r.razorpay_order_id,
                razorpay_payment_id: r.razorpay_payment_id,
                razorpay_signature: r.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error ?? "Verification failed");

            setCompletedDonationId(orderData.donationId);
            setStep("success");
          } catch {
            setError(t("errorGeneric"));
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      });

      rzp.on("payment.failed", () => {
        setError(t("errorGeneric"));
        setProcessing(false);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setError(t("errorGeneric"));
      setProcessing(false);
    }
  }

  function resetForm() {
    setStep("form");
    setName("");
    setPhone("");
    setEmail("");
    setCity("");
    setMessage("");
    setSelectedPreset(101);
    setCustomAmount("");
    setCompletedDonationId(null);
    setError(null);
  }

  if (step === "success" && completedDonationId) {
    return (
      <div className="rounded-2xl border border-gold-300 bg-cream-50 p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-saffron-500/15 text-3xl">
          🙏
        </div>
        <h3 className="font-display text-2xl text-maroon-700 mb-2">{t("successTitle")}</h3>
        <p className="text-ink/70 mb-6">{t("successSubtitle")}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`/api/invoice/${completedDonationId}`}
            className="inline-flex items-center justify-center rounded-full bg-maroon-700 px-6 py-3 font-semibold text-cream-50 hover:bg-maroon-800 transition-colors"
          >
            {t("downloadInvoice")}
          </a>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center rounded-full border border-maroon-700 px-6 py-3 font-semibold text-maroon-700 hover:bg-maroon-50 transition-colors"
          >
            {t("makeAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gold-300 bg-cream-50 p-6 sm:p-8 shadow-xl"
    >
      <h3 className="font-display text-2xl text-maroon-700">{t("formTitle")}</h3>
      <p className="text-ink/60 text-sm mt-1 mb-6">{t("formSubtitle")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-semibold text-ink/80 mb-1">
            {t("nameLabel")}
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold-500 outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-ink/80 mb-1">
            {t("phoneLabel")}
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder={t("phonePlaceholder")}
            maxLength={10}
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold-500 outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-ink/80 mb-1">
            {t("emailLabel")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-ink/80 mb-1">
            {t("cityLabel")}
          </label>
          <input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("cityPlaceholder")}
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-ink/80 mb-1">
            {t("messageLabel")}
          </label>
          <input
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("messagePlaceholder")}
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold-500 outline-none"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-ink/80 mb-2">{t("amountLabel")}</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handlePresetClick(val)}
              className={clsx(
                "rounded-full border px-4 py-2 font-number font-semibold text-sm transition-colors",
                selectedPreset === val
                  ? "border-maroon-700 bg-maroon-700 text-cream-50"
                  : "border-ink/15 text-ink/80 hover:border-gold-500"
              )}
            >
              ₹{val}
            </button>
          ))}
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={customAmount}
          onChange={(e) => handleCustomAmountChange(e.target.value)}
          placeholder={t("customAmount")}
          className="w-full rounded-lg border border-ink/15 px-4 py-2.5 focus:border-gold-500 outline-none font-number"
        />
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-maroon-50 border border-maroon-300 px-4 py-2 text-sm text-maroon-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={processing}
        className={clsx(
          "w-full rounded-full py-3.5 font-display text-lg tracking-wide text-cream-50 shadow-lg transition-all",
          processing
            ? "bg-maroon-400 cursor-not-allowed"
            : "bg-gradient-to-r from-maroon-700 via-maroon-600 to-saffron-600 hover:brightness-110"
        )}
      >
        {processing ? t("payButtonProcessing") : `${t("payButton")} · ₹${amount || 0}`}
      </button>

      <p className="mt-4 text-center text-xs text-ink/50">{t("footerNote")}</p>
    </form>
  );
}
