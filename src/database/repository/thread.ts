import mongoose from "mongoose";
import ThreadModel, { Thread } from "../schemas/thread";
import connectToDatabase from "../connection";

class ThreadRepository {
  constructor() {
    connectToDatabase();
  }
  async createThread(name: string, model: string, usage: { prompt_tokens: number, completion_tokens: number }, messages: { role: string, content: string }[]) {
    const thread = new ThreadModel({
      name,
      lastUpdated: new Date(),
      model,
      usage,
      messages,
    });
    await thread.save();
    return thread;
  };
  async listThreads(): Promise<Thread[]> {
    const threads = await ThreadModel.find();
    if (threads.length === 0) {
      return [];
    }
    const threadObjects = threads.map((thread) => {
      // Utilisez toObject() pour convertir chaque Document en un objet JavaScript brut
      const threadObject = thread.toObject();
      return threadObject as unknown as Thread;
    });
    return threadObjects as Thread[];
  }
  async getThreadById(id: string): Promise<Thread | null> {
    const thread = await ThreadModel.findById(id);
    if (!thread) {
      return null;
    }
    return thread.toObject() as Thread;
  };
  async getThreadByName(name: string): Promise<Thread | null> {
    const thread = await ThreadModel.findOne({ name });
    if (!thread) {
      return null;
    }
    return thread.toObject() as Thread;
  };
  async updateThread(id: string, update: Partial<Thread>): Promise<Thread | null> {
    const thread = await ThreadModel.findByIdAndUpdate(id, update, { new: true });
    if (!thread) {
      return null;
    }
    return thread.toObject() as Thread;
  };
  async deleteThread(id: string): Promise<void> {
    await ThreadModel.findByIdAndDelete(id);
  };
}

export default ThreadRepository;
