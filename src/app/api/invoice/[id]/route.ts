import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import MandalConfig, { IMandalConfig } from "@/models/MandalConfig";
import { generateInvoicePdf } from "@/lib/invoice";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const donation = await Donation.findById(params.id);

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }
    if (donation.status !== "paid") {
      return NextResponse.json(
        { error: "Receipt is only available once payment is confirmed" },
        { status: 409 }
      );
    }

    const mandalConfig = await MandalConfig.findOne().lean<IMandalConfig>();

    const pdfBuffer = await generateInvoicePdf(donation, {
      mandalName: mandalConfig?.mandalName ?? process.env.MANDAL_NAME ?? "Shivtej Tarun Ganesh Mandal",
      address: process.env.MANDAL_ADDRESS ?? "Gaikwadwasti, Someshwarnagar, Tal: Baramati, Dist: Pune 412306",
      year: mandalConfig?.year ?? 2026,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vargani-receipt-${donation.receiptNumber ?? donation._id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Error generating invoice:", err);
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}
