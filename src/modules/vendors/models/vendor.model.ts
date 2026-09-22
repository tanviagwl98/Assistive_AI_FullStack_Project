import { model, models, Schema } from "mongoose";
import { VENDOR_SOURCES } from "@/constants/domain";
const schema = new Schema({ weddingId: { type: Schema.Types.ObjectId, required: true, ref: "Wedding" }, name: { type: String, required: true }, category: { type: String, required: true }, contactPerson: String, phone: String, email: String, address: String, website: String, totalAgreedCostPaise: { type: Number, min: 0 }, eventIds: [{ type: Schema.Types.ObjectId, ref: "Event" }], notes: String, source: { type: String, enum: VENDOR_SOURCES, required: true }, googlePlaceId: String, archivedAt: Date }, { timestamps: true });
schema.index({ weddingId: 1, category: 1 }); schema.index({ weddingId: 1, archivedAt: 1 }); schema.index({ weddingId: 1, googlePlaceId: 1 });
export const Vendor = models.Vendor ?? model("Vendor", schema);
