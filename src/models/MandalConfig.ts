import mongoose, { Schema, models, model } from "mongoose";

export interface IMandalConfig {
  _id: mongoose.Types.ObjectId;
  mandalName: string;
  year: number;
  goalAmount: number;
  upiId: string;
  sthapanaDate: string; // ISO date string, e.g. "2026-09-14"
  visarjanDate: string; // ISO date string, e.g. "2026-09-25"
}

const MandalConfigSchema = new Schema<IMandalConfig>({
  mandalName: { type: String, required: true, default: "Shivtej Tarun Ganesh Mandal" },
  year: { type: Number, required: true, default: 2026 },
  goalAmount: { type: Number, required: true, default: 200000 },
  upiId: { type: String, required: true, default: "" },
  sthapanaDate: { type: String, required: true, default: "2026-09-14" },
  visarjanDate: { type: String, required: true, default: "2026-09-25" },
});

export default models.MandalConfig ||
  model<IMandalConfig>("MandalConfig", MandalConfigSchema);
