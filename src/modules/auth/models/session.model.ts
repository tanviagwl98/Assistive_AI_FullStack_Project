import { model, models, Schema } from "mongoose";
const schema = new Schema({ userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true }, tokenHash: { type: String, required: true, unique: true }, expiresAt: { type: Date, required: true, index: { expires: 0 } }, lastUsedAt: Date }, { timestamps: { createdAt: true, updatedAt: false } });
export const Session = models.Session ?? model("Session", schema);
