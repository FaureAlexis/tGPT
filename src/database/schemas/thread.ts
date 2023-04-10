import mongoose from "mongoose";
import { ChatCompletionRequestMessage } from "openai";

export interface Thread {
  _id?: mongoose.Schema.Types.ObjectId;
  name: string;
  lastUpdated: Date;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
  messages: ChatCompletionRequestMessage[];
}


const threadSchema = new mongoose.Schema({
  name: String,
  lastUpdated: Date,
  model: String,
  usage: {
    prompt_tokens: Number,
    completion_tokens: Number,
  },
  messages: [
    {
      role: String,
      content: String,
    },
  ],
});

export default mongoose.model("Thread", threadSchema);
