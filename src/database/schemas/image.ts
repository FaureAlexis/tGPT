import mongoose from "mongoose";

export interface Image {
  url: string;
  createdAt: Date;
  prompt: string;
};

const imageSchema = new mongoose.Schema({
  url: String,
  createdAt: Date,
  prompt: String,
});

export default mongoose.model("Image", imageSchema);
