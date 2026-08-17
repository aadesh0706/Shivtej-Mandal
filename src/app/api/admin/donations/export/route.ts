import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import { getAdminFromRequest } from "@/lib/auth";

function csvEscape(value: unknown): string {
  let str = value === undefined || value === null ? "" : String(value);
  // Neutralize formula injection: spreadsheet apps treat a leading =, +, -, or
  // @ as the start of a formula, and donor-supplied fields (name, city,
  // message) are attacker-controlled input here.
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectToDatabase();
  const donations = await Donation.find({ status: "paid" }).sort({ createdAt: -1 }).lean();

  const header = [
    "Receipt No",
    "Name",
    "Phone",
    "Email",
    "City",
    "Amount",
    "Payment Method",
    "Payment Ref",
    "Date",
  ];

  const rows = donations.map((d) =>
    [
      d.receiptNumber,
      d.name,
      d.phone,
      d.email,
      d.city,
      d.amount,
      d.paymentMethod,
      d.razorpayPaymentId,
      new Date(d.createdAt).toLocaleString("en-IN"),
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="vargani-donations-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
