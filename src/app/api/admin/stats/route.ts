import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import MandalConfig, { IMandalConfig } from "@/models/MandalConfig";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectToDatabase();

  const [totals, byMethod, config, todayTotal] = await Promise.all([
    Donation.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Donation.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    MandalConfig.findOne().lean<IMandalConfig>(),
    Donation.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);

  return NextResponse.json({
    totalAmount: totals[0]?.total ?? 0,
    totalDonors: totals[0]?.count ?? 0,
    goalAmount: config?.goalAmount ?? 0,
    byMethod,
    today: {
      total: todayTotal[0]?.total ?? 0,
      count: todayTotal[0]?.count ?? 0,
    },
  });
}
