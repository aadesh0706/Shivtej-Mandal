import type { Metadata } from "next";
import { Yatra_One, Mukta, Poppins } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";

const display = Yatra_One({
  subsets: ["latin", "devanagari"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const body = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const number = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-number",
  display: "swap",
});

const title = "Shivtej Tarun Ganesh Mandal | श्री शिवतेज तरुण गणेश मंडळ - Ganeshotsav Vargani";
const description =
  "Offer your Ganeshotsav vargani (donation) to Shivtej Tarun Ganesh Mandal, Gaikwadwasti, Someshwarnagar online via UPI/Razorpay and download your receipt instantly.";

export const metadata: Metadata = {
  // Needed so the relative og:image path below resolves to an absolute URL -
  // set NEXT_PUBLIC_SITE_URL to the real deployed domain once it's known.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  openGraph: {
    title,
    description,
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
    locale: "mr_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mr">
      <body className={`${display.variable} ${body.variable} ${number.variable} font-body`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
