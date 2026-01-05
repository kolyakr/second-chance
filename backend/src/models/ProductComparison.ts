import mongoose, { Document, Schema } from "mongoose";

export interface IProductComparison extends Document {
  user: mongoose.Types.ObjectId;
  posts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductComparisonSchema = new Schema<IProductComparison>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Limit to 4 products per comparison
ProductComparisonSchema.pre("save", function (next) {
  if (this.posts.length > 4) {
    this.posts = this.posts.slice(0, 4);
  }
  next();
});

ProductComparisonSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IProductComparison>(
  "ProductComparison",
  ProductComparisonSchema
);

