import { Schema, models, model } from "mongoose";

interface ICounter {
  _id: string; // e.g. "receipt-2026"
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default models.Counter || model<ICounter>("Counter", CounterSchema);
