import mongoose, { Document, Schema } from "mongoose";

export interface IViewHistory extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  viewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ViewHistorySchema = new Schema<IViewHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one entry per user per post, update viewedAt on duplicate
ViewHistorySchema.index({ user: 1, post: 1 }, { unique: true });
ViewHistorySchema.index({ user: 1, viewedAt: -1 });

export default mongoose.model<IViewHistory>("ViewHistory", ViewHistorySchema);

