import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import { verifyCheckoutSignature } from "@/lib/verifyRazorpaySignature";
import { nextReceiptNumber } from "@/lib/receiptNumber";

const verifySchema = z.object({
  donationId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { donationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      parsed.data;

    const isValid = verifyCheckoutSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }

    await connectToDatabase();
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    if (donation.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
    }

    // Idempotent: if the webhook already marked this paid, don't double-assign a receipt number
    if (donation.status !== "paid") {
      donation.status = "paid";
      donation.razorpayPaymentId = razorpay_payment_id;
      donation.razorpaySignatureVerified = true;
      donation.receiptNumber = donation.receiptNumber ?? (await nextReceiptNumber());
      await donation.save();
    }

    return NextResponse.json({ status: "paid", donationId: donation._id.toString() });
  } catch (err) {
    console.error("Error verifying donation:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
