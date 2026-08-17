import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import { nextReceiptNumber } from "@/lib/receiptNumber";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // Belt-and-braces: middleware already guards this path, but we check again
  // here so this route stays safe even if middleware config ever changes.
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Math.trunc(Number(searchParams.get("page"))) || 1);
  const pageSize = Math.min(100, Math.max(1, Math.trunc(Number(searchParams.get("pageSize"))) || 25));
  const status = searchParams.get("status"); // paid | created | failed | pending_manual | null (all)
  const search = searchParams.get("search")?.trim();

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { phone: { $regex: escaped, $options: "i" } },
      { receiptNumber: { $regex: escaped, $options: "i" } },
    ];
  }

  const [donations, total] = await Promise.all([
    Donation.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Donation.countDocuments(filter),
  ]);

  return NextResponse.json({
    donations,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// Admin manually records a donation received outside the site (e.g. cash,
// or a direct UPI/GPay transfer that has no automatic webhook confirmation).
const manualDonationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(15),
  amount: z.number().int().min(1).max(1000000),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(300).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = manualDonationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await connectToDatabase();
    const { name, phone, amount, city, message } = parsed.data;

    const donation = await Donation.create({
      name,
      phone,
      amount,
      city: city || undefined,
      message: message || undefined,
      paymentMethod: "upi_manual",
      status: "paid",
      razorpaySignatureVerified: false,
      markedPaidBy: admin.email,
      receiptNumber: await nextReceiptNumber(),
    });

    return NextResponse.json({ donation }, { status: 201 });
  } catch (err) {
    console.error("Error recording manual donation:", err);
    return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
  }
}
