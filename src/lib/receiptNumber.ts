import Counter from "@/models/Counter";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * Returns the next receipt number for the current year, e.g. "SM2026-0007".
 * Uses an atomic findOneAndUpdate increment so concurrent payments never
 * collide on the same number.
 */
export async function nextReceiptNumber(): Promise<string> {
  await connectToDatabase();
  const year = new Date().getFullYear();
  const key = `receipt-${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const padded = String(counter.seq).padStart(4, "0");
  return `SM${year}-${padded}`;
}
