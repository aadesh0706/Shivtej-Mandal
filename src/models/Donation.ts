import mongoose, { Schema, models, model } from "mongoose";

export type DonationStatus = "created" | "paid" | "failed" | "pending_manual";
export type PaymentMethod = "razorpay" | "upi_manual";

export interface IDonation {
  _id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  amount: number; // in rupees (whole number)
  message?: string;
  city?: string;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignatureVerified: boolean;
  receiptNumber?: string; // human-friendly sequential number, assigned on paid
  invoiceGeneratedAt?: Date;
  markedPaidBy?: string; // admin email, for manual/UPI donations
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 1 },
    message: { type: String, trim: true, maxlength: 300 },
    city: { type: String, trim: true, maxlength: 120 },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "upi_manual"],
      default: "razorpay",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "pending_manual"],
      default: "created",
      index: true,
    },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignatureVerified: { type: Boolean, default: false },
    receiptNumber: { type: String },
    invoiceGeneratedAt: { type: Date },
    markedPaidBy: { type: String },
  },
  { timestamps: true }
);

// Fast lookups for the public "recent donors" wall and admin table sorting
DonationSchema.index({ status: 1, createdAt: -1 });

export default models.Donation || model<IDonation>("Donation", DonationSchema);
