import { model, models, Schema } from "mongoose";
import { EVENT_TYPES } from "@/constants/domain";
const schema = new Schema({ weddingId: { type: Schema.Types.ObjectId, required: true, ref: "Wedding" }, name: { type: String, required: true }, type: { type: String, enum: EVENT_TYPES }, startsAt: { type: Date, required: true }, endsAt: Date, venueName: String, address: String, description: String, dressCode: String, coverImageObjectKey: String, archivedAt: Date }, { timestamps: true });
schema.index({ weddingId: 1, startsAt: 1 }); schema.index({ weddingId: 1, archivedAt: 1 });
export const Event = models.Event ?? model("Event", schema);
