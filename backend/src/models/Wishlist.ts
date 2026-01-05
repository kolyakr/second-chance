import mongoose, { Document, Schema } from "mongoose";

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
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
  },
  {
    timestamps: true,
  }
);

// Ensure one wishlist entry per user per post
WishlistSchema.index({ user: 1, post: 1 }, { unique: true });
WishlistSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IWishlist>("Wishlist", WishlistSchema);

