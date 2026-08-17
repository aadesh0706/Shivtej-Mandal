import { connectToDatabase } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import MandalConfig, { IMandalConfig } from "@/models/MandalConfig";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic"; // always show fresh totals, never cache this page

async function getInitialData() {
  await connectToDatabase();

  // Atomic upsert so two concurrent first-ever requests can't each create
  // their own MandalConfig document (findOne + create would race).
  const config = await MandalConfig.findOneAndUpdate(
    {},
    {
      $setOnInsert: {
        mandalName: process.env.MANDAL_NAME ?? "Shivtej Tarun Ganesh Mandal",
        upiId: process.env.MANDAL_UPI_ID ?? "",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean<IMandalConfig>();

  // upsert + new:true always return the document; the null case only exists
  // in the type signature for non-upsert calls.
  if (!config) throw new Error("Failed to load or create MandalConfig");

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

  return {
    config: {
      mandalName: config.mandalName,
      year: config.year,
      goalAmount: config.goalAmount,
      sthapanaDate: config.sthapanaDate,
      visarjanDate: config.visarjanDate,
    },
    donors: recent.map((d) => ({
      name: d.name,
      amount: d.amount,
      city: d.city ?? null,
    })),
    totalAmount: agg[0]?.total ?? 0,
    totalDonors: agg[0]?.count ?? 0,
  };
}

export default async function HomePage() {
  const data = await getInitialData();
  return <HomeClient initial={data} />;
}
