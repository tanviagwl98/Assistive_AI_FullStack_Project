import { model, models, Schema } from "mongoose";
const schema = new Schema({ userId: { type: Schema.Types.ObjectId, required: true, ref: "User", unique: true }, weddingId: { type: Schema.Types.ObjectId, required: true, ref: "Wedding" }, role: { type: String, enum: ["ADMIN", "MANAGER"], required: true }, joinedAt: { type: Date, default: Date.now } }, { timestamps: true });
schema.index({ weddingId: 1, userId: 1 }, { unique: true }); schema.index({ weddingId: 1, role: 1 });
export const WeddingMembership = models.WeddingMembership ?? model("WeddingMembership", schema);
