import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  content: string;
  answer?: string;
  answeredBy?: mongoose.Types.ObjectId;
  answeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
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
    content: {
      type: String,
      required: [true, "Please provide question content"],
      trim: true,
      maxlength: 500,
    },
    answer: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    answeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    answeredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

QuestionSchema.index({ post: 1, createdAt: -1 });
QuestionSchema.index({ user: 1 });

export default mongoose.model<IQuestion>("Question", QuestionSchema);

