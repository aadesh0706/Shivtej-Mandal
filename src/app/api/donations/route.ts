import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import { getRazorpayClient } from "@/lib/razorpay";

const createDonationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(15),
  email: z.string().trim().email().optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(300).optional().or(z.literal("")),
  amount: z.number().int().min(51).max(1000000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createDonationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, email, city, message, amount } = parsed.data;

    await connectToDatabase();

    const donation = await Donation.create({
      name,
      phone,
      email: email || undefined,
      city: city || undefined,
      message: message || undefined,
      amount,
      paymentMethod: "razorpay",
      status: "created",
      razorpaySignatureVerified: false,
    });

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects paise
      currency: "INR",
      receipt: donation._id.toString(),
      notes: {
        donationId: donation._id.toString(),
        donorName: name,
      },
    });

    donation.razorpayOrderId = order.id;
    await donation.save();

    return NextResponse.json({
      donationId: donation._id.toString(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Error creating donation order:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
