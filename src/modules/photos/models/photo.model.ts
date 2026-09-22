import { model, models, Schema } from "mongoose";
import { PHOTO_UPLOADER_TYPES } from "@/constants/domain";
const schema = new Schema({ weddingId: { type: Schema.Types.ObjectId, required: true, ref: "Wedding" }, eventId: { type: Schema.Types.ObjectId, ref: "Event" }, objectKey: { type: String, required: true, unique: true }, originalFilename: String, mimeType: { type: String, required: true }, sizeBytes: { type: Number, required: true }, uploaderType: { type: String, enum: PHOTO_UPLOADER_TYPES, required: true }, uploadedByMembershipId: { type: Schema.Types.ObjectId, ref: "WeddingMembership" } }, { timestamps: true });
schema.index({ weddingId: 1, createdAt: -1 }); schema.index({ weddingId: 1, eventId: 1, createdAt: -1 });
export const Photo = models.Photo ?? model("Photo", schema);
