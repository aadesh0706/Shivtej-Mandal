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

export const metadata: Metadata = {
  title: "Shivtej Tarun Ganesh Mandal | श्री शिवतेज तरुण गणेश मंडळ - Ganeshotsav Vargani",
  description:
    "Offer your Ganeshotsav vargani (donation) to Shivtej Tarun Ganesh Mandal, Gaikwadwasti, Someshwarnagar online via UPI/Razorpay and download your receipt instantly.",
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
