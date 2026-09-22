import { model, models, Schema } from "mongoose";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/constants/domain";
const schema = new Schema({ weddingId: { type: Schema.Types.ObjectId, required: true, ref: "Wedding" }, title: { type: String, required: true }, description: String, assignedMembershipId: { type: Schema.Types.ObjectId, ref: "WeddingMembership" }, eventId: { type: Schema.Types.ObjectId, ref: "Event" }, dueDate: Date, priority: { type: String, enum: TASK_PRIORITIES, default: "MEDIUM" }, status: { type: String, enum: TASK_STATUSES, default: "TODO" }, completedAt: Date }, { timestamps: true });
schema.index({ weddingId: 1, status: 1 }); schema.index({ weddingId: 1, dueDate: 1 }); schema.index({ weddingId: 1, assignedMembershipId: 1, status: 1 }); schema.index({ weddingId: 1, eventId: 1 });
export const Task = models.Task ?? model("Task", schema);
