import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId; // Reviewer
  post: mongoose.Types.ObjectId;
  postOwner: mongoose.Types.ObjectId; // User being reviewed
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
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
    postOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per post
ReviewSchema.index({ user: 1, post: 1 }, { unique: true });
ReviewSchema.index({ postOwner: 1, rating: 1 });

export default mongoose.model<IReview>("Review", ReviewSchema);
