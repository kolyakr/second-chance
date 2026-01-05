import mongoose, { Document, Schema } from "mongoose";

export interface ISavedSearch extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  filters: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    season?: string;
    size?: string;
    brand?: string;
    search?: string;
    sortBy?: string;
    order?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SavedSearchSchema = new Schema<ISavedSearch>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    filters: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SavedSearchSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<ISavedSearch>("SavedSearch", SavedSearchSchema);

