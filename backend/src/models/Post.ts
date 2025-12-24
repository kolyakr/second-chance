import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  category: "men" | "women" | "children" | "accessories" | "footwear";
  subcategory?: string;
  size?: string;
  brand?: string;
  material?: string;
  condition: "new" | "like-new" | "used" | "with-defects";
  conditionDetails?: string;
  price?: number;
  color?: string;
  season?: string[];
  tags: string[];
  location?: string;
  isPublic: boolean;
  status: "active" | "sold" | "archived";
  views: number;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
      maxlength: 2000,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      enum: ["men", "women", "children", "accessories", "footwear"],
      required: true,
    },
    subcategory: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    size: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    material: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    condition: {
      type: String,
      enum: ["new", "like-new", "used", "with-defects"],
      required: true,
    },
    conditionDetails: {
      type: String,
      maxlength: 500,
    },
    price: {
      type: Number,
      min: 0,
    },
    color: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    season: [
      {
        type: String,
        enum: ["spring", "summer", "fall", "winter", "all-season"],
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    location: {
      type: String,
      maxlength: 100,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "sold", "archived"],
      default: "active",
    },
    views: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
PostSchema.index({ user: 1, createdAt: -1 });
PostSchema.index({ category: 1, status: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ likesCount: -1, commentsCount: -1, views: -1 });

export default mongoose.model<IPost>("Post", PostSchema);
