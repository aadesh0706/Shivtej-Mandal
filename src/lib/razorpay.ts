import Razorpay from "razorpay";

let instance: Razorpay | null = null;

/**
 * Server-only Razorpay client. Never import this from a "use client" component -
 * it uses RAZORPAY_KEY_SECRET which must never reach the browser.
 */
export function getRazorpayClient(): Razorpay {
  if (instance) return instance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Add them to .env.local (see .env.example)."
    );
  }

  instance = new Razorpay({ key_id, key_secret });
  return instance;
}
