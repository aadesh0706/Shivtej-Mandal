import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Donation from "@/models/Donation";

export async function GET() {
  try {
    await connectToDatabase();

    const [recent, agg] = await Promise.all([
      Donation.find({ status: "paid" })
        .sort({ createdAt: -1 })
        .limit(25)
        .select("name amount city createdAt")
        .lean(),
      Donation.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
    ]);

    const totals = agg[0] ?? { total: 0, count: 0 };

    return NextResponse.json({
      donors: recent.map((d) => ({
        name: d.name,
        amount: d.amount,
        city: d.city ?? null,
        createdAt: d.createdAt,
      })),
      totalAmount: totals.total,
      totalDonors: totals.count,
    });
  } catch (err) {
    console.error("Error fetching recent donations:", err);
    return NextResponse.json({ error: "Failed to load donors" }, { status: 500 });
  }
}
