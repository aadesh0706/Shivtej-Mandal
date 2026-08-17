import PDFDocument from "pdfkit";
import { IDonation } from "@/models/Donation";
import { amountToWords } from "@/lib/numberToWords";

interface InvoiceMandalInfo {
  mandalName: string;
  address: string;
  year: number;
}

const MAROON = "#6B1420";
const GOLD = "#C89B3C";
const INK = "#2A1810";

/**
 * Renders a donation receipt as a PDF and resolves with the Buffer.
 *
 * Note: pdfkit's built-in fonts only cover Latin script. To print the
 * mandal name / labels in Devanagari, embed a Devanagari TTF (e.g. Noto
 * Sans Devanagari) via doc.registerFont('Marathi', 'path/to/font.ttf')
 * and .font('Marathi') below - left as English-only for now so the
 * receipt renders correctly out of the box.
 */
export function generateInvoicePdf(
  donation: IDonation,
  mandal: InvoiceMandalInfo
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // --- Header band ---
      doc.rect(0, 0, doc.page.width, 130).fill(MAROON);
      doc
        .fillColor(GOLD)
        .fontSize(24)
        .font("Helvetica-Bold")
        .text(mandal.mandalName, 50, 40);
      doc
        .fillColor("#F7EFE1")
        .fontSize(11)
        .font("Helvetica")
        .text(mandal.address, 50, 72)
        .text(`Ganeshotsav ${mandal.year} - Vargani Donation Receipt`, 50, 88);

      doc.fillColor(INK);

      // --- Receipt meta ---
      const metaTop = 155;
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Receipt No: ${donation.receiptNumber ?? donation._id.toString().slice(-8).toUpperCase()}`, 50, metaTop)
        .text(`Date: ${new Date(donation.updatedAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}`, 50, metaTop + 16);

      doc
        .moveTo(50, metaTop + 45)
        .lineTo(doc.page.width - 50, metaTop + 45)
        .strokeColor(GOLD)
        .lineWidth(1.5)
        .stroke();

      // --- Donor details ---
      let y = metaTop + 65;
      const row = (label: string, value: string) => {
        doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text(label, 50, y, { width: 150 });
        doc.font("Helvetica").fontSize(11).fillColor(INK).text(value || "-", 210, y, { width: 335 });
        y += 24;
      };

      row("Donor Name", donation.name);
      row("Mobile", donation.phone);
      if (donation.email) row("Email", donation.email);
      if (donation.city) row("City / Village", donation.city);
      row("Payment Method", donation.paymentMethod === "razorpay" ? "Online (Razorpay)" : "UPI");
      if (donation.razorpayPaymentId) row("Payment Ref", donation.razorpayPaymentId);
      if (donation.message) row("Message", donation.message);

      // --- Amount block ---
      y += 15;
      doc.rect(50, y, doc.page.width - 100, 70).fill("#FBF6E9").stroke();
      doc
        .fillColor(MAROON)
        .font("Helvetica-Bold")
        .fontSize(20)
        .text(`Amount: Rs. ${donation.amount.toLocaleString("en-IN")}`, 65, y + 14);
      doc
        .fillColor(INK)
        .font("Helvetica-Oblique")
        .fontSize(10)
        .text(`In words: ${amountToWords(donation.amount)}`, 65, y + 42, {
          width: doc.page.width - 130,
        });

      // --- Footer ---
      const footerY = doc.page.height - 100;
      doc
        .moveTo(50, footerY)
        .lineTo(doc.page.width - 50, footerY)
        .strokeColor(GOLD)
        .lineWidth(1)
        .stroke();
      doc
        .fillColor("#7A6E63")
        .font("Helvetica")
        .fontSize(9)
        .text(
          "This is a system-generated donation receipt acknowledging your Ganeshotsav vargani contribution. " +
            "It is not an income-tax exemption certificate under Section 80G unless separately stated.",
          50,
          footerY + 12,
          { width: doc.page.width - 100 }
        );
      doc
        .fillColor(MAROON)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Ganpati Bappa Morya!", 50, footerY + 45, {
          width: doc.page.width - 100,
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
