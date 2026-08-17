"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Lang = "mr" | "en";

export const dictionary = {
  mr: {
    siteName: "श्री शिवतेज तरुण गणेश मंडळ",
    heroEyebrow: "श्री गणेशोत्सव २०२६",
    heroTitle: "बाप्पाच्या चरणी वर्गणी अर्पण करा",
    heroSubtitle:
      "स्थापना १४ सप्टेंबर, विसर्जन २५ सप्टेंबर — तुमच्या योगदानाने उत्सव अधिक भव्य होतो.",
    heroCta: "आत्ता वर्गणी भरा",
    goalLabel: "आतापर्यंत जमा",
    goalOf: "उद्दिष्टापैकी",
    donorsLabel: "देणगीदार",
    formTitle: "वर्गणी अर्पण करा",
    formSubtitle: "तुमचे नाव आणि रक्कम टाका, पेमेंट करा आणि पावती लगेच डाउनलोड करा.",
    nameLabel: "पूर्ण नाव",
    namePlaceholder: "उदा. रमेश जोशी",
    phoneLabel: "मोबाईल नंबर",
    phonePlaceholder: "१० अंकी मोबाईल नंबर",
    emailLabel: "ईमेल (ऐच्छिक)",
    emailPlaceholder: "पावती ईमेलवर हवी असल्यास",
    cityLabel: "गाव / शहर (ऐच्छिक)",
    cityPlaceholder: "उदा. पुणे",
    messageLabel: "शुभेच्छा संदेश (ऐच्छिक)",
    messagePlaceholder: "गणपती बाप्पा मोरया!",
    amountLabel: "रक्कम (₹)",
    customAmount: "इतर रक्कम",
    payButton: "पेमेंट करा",
    payButtonProcessing: "प्रक्रिया सुरू आहे…",
    recentDonorsTitle: "अलीकडील देणगीदार",
    footerNote: "ही देणगी नोंद पावती आहे, आयकर सवलत पावती नाही.",
    successTitle: "धन्यवाद! तुमची वर्गणी यशस्वी झाली 🙏",
    successSubtitle: "गणपती बाप्पा तुमच्या कुटुंबाला सुख-समृद्धी देवोत.",
    downloadInvoice: "पावती डाउनलोड करा",
    makeAnother: "आणखी एक वर्गणी भरा",
    errorGeneric: "काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.",
    errorMinAmount: "किमान रक्कम ₹५१ आहे.",
    errorRequiredFields: "कृपया नाव, मोबाईल नंबर आणि रक्कम भरा.",
    adminLoginTitle: "प्रशासक प्रवेश",
    adminEmail: "ईमेल",
    adminPassword: "पासवर्ड",
    adminLoginButton: "लॉगिन करा",
    days: "दिवस",
  },
  en: {
    siteName: "Shivtej Tarun Ganesh Mandal",
    heroEyebrow: "Ganeshotsav 2026",
    heroTitle: "Offer Your Vargani to Bappa",
    heroSubtitle:
      "Sthapana on 14th September, Visarjan on 25th September — your contribution makes the celebration grander.",
    heroCta: "Donate Now",
    goalLabel: "Raised so far",
    goalOf: "of goal",
    donorsLabel: "donors",
    formTitle: "Make Your Vargani",
    formSubtitle: "Enter your name and amount, pay, and download your receipt instantly.",
    nameLabel: "Full name",
    namePlaceholder: "e.g. Ramesh Joshi",
    phoneLabel: "Mobile number",
    phonePlaceholder: "10-digit mobile number",
    emailLabel: "Email (optional)",
    emailPlaceholder: "To receive receipt by email",
    cityLabel: "City / Village (optional)",
    cityPlaceholder: "e.g. Pune",
    messageLabel: "A message (optional)",
    messagePlaceholder: "Ganpati Bappa Morya!",
    amountLabel: "Amount (₹)",
    customAmount: "Custom amount",
    payButton: "Pay Now",
    payButtonProcessing: "Processing…",
    recentDonorsTitle: "Recent Donors",
    footerNote: "This is a donation receipt, not an income-tax exemption certificate.",
    successTitle: "Thank you! Your vargani was successful 🙏",
    successSubtitle: "May Ganpati Bappa bless your family with prosperity.",
    downloadInvoice: "Download Receipt",
    makeAnother: "Make another donation",
    errorGeneric: "Something went wrong. Please try again.",
    errorMinAmount: "Minimum amount is ₹51.",
    errorRequiredFields: "Please fill in name, mobile number, and amount.",
    adminLoginTitle: "Admin Login",
    adminEmail: "Email",
    adminPassword: "Password",
    adminLoginButton: "Log in",
    days: "days",
  },
} as const;

export type DictionaryKey = keyof typeof dictionary.mr;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictionaryKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "vargani-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("mr");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "mr" || stored === "en") {
      setLangState(stored);
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const t = useMemo(() => {
    return (key: DictionaryKey) => dictionary[lang][key] ?? dictionary.mr[key];
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
