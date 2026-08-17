import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import { verifyWebhookSignature } from "@/lib/verifyRazorpaySignature";
import { nextReceiptNumber } from "@/lib/receiptNumber";

// Razorpay signs the raw request body, so we must read it as text
// before any JSON parsing happens.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  try {
    await connectToDatabase();

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload?.payment?.entity;
      const orderId: string | undefined = payment?.order_id;
      const paymentId: string | undefined = payment?.id;

      if (orderId) {
        const donation = await Donation.findOne({ razorpayOrderId: orderId });
        if (donation && donation.status !== "paid") {
          donation.status = "paid";
          donation.razorpayPaymentId = paymentId ?? donation.razorpayPaymentId;
          donation.razorpaySignatureVerified = true;
          donation.receiptNumber = donation.receiptNumber ?? (await nextReceiptNumber());
          await donation.save();
        }
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      const orderId: string | undefined = payment?.order_id;
      if (orderId) {
        await Donation.findOneAndUpdate(
          { razorpayOrderId: orderId, status: { $ne: "paid" } },
          { status: "failed" }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Still return 200-range would hide real issues from Razorpay's retry logic,
    // so surface a 500 and let Razorpay retry the delivery.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
