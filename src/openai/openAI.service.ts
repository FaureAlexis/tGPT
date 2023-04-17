import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, CreateCompletionRequest, CreateImageRequest, CreateModerationRequest, OpenAIApi } from 'openai';
import fs from 'fs';
import { botEnv } from '../env/config';
import escapeString from '../utils/escapeString';
import ImageRepository from '../database/repository/image';
import ThreadRepository from '../database/repository/thread';
import { Thread } from '../database/schemas/thread';
import mongoose from 'mongoose';
import { code } from '../prompt/prompts';
import { AxiosError } from 'axios';

class AIService {
  private openai: OpenAIApi;
  private imageRepository: ImageRepository;
  private threadRepository: ThreadRepository;
  private Thread: Thread | null = null;

  constructor() {
    const configuration = new Configuration({
      apiKey: botEnv.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
    this.imageRepository = new ImageRepository();
    this.threadRepository = new ThreadRepository();
    if (!this.Thread) {
      this.Thread = {
        messages: [],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
        },
        name: 'default',
        model: 'gpt-3.5-turbo',
        lastUpdated: new Date(),
      } as Thread;
      this.Thread.messages.push({
        role: 'user',
        content: code,
      } as ChatCompletionRequestMessage);
    }
  }

  async reply(message: string): Promise<string> {
    const isNotAppropriate: boolean = await this.checkIfMessageIsFlagged(message);
    if (isNotAppropriate) {
      return '🛑 \\- Ce message n\'est pas approprié';
    }
    const AiOptions = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
    };

    const userMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: message,
    };
    if (!this.Thread) {
      return 'Une erreur est survenue';
    }
    this.Thread.messages.push(userMessage);
    while (this.Thread.usage.prompt_tokens + this.Thread.usage.completion_tokens + 1000 > 4097) {
      this.Thread.messages.shift();
      this.Thread.usage.prompt_tokens -= this.Thread.messages[0].content.split(' ').length;
      this.Thread.usage.completion_tokens -= this.Thread.messages[0].content.split(' ').length;
    }
    const payload: CreateChatCompletionRequest = {
      model: this.Thread.model,
      messages: this.Thread.messages,
      ...AiOptions,
    };

    try {
      const aiResponse = await this.openai.createChatCompletion(payload);
      if (
        aiResponse.data.choices.length === 0 &&
        !aiResponse.data.choices[0].message
      ) {
        return 'Je n\'ai pas compris votre message';
      }
      const botResponse: ChatCompletionRequestMessage =
        aiResponse.data.choices[0].message as ChatCompletionRequestMessage;
      this.Thread.messages.push(botResponse);
      this.Thread.usage.completion_tokens += aiResponse.data.usage?.completion_tokens || 0;
      this.Thread.usage.prompt_tokens += aiResponse.data.usage?.prompt_tokens || 0;
      this.Thread.lastUpdated = new Date();
      if (this.Thread._id && this.Thread._id !== undefined) {
        await this.threadRepository.updateThread(this.Thread._id  as unknown as string, this.Thread);
      } else {
        const thread = await this.threadRepository.createThread(
          this.Thread.name,
          this.Thread.model,
          this.Thread.usage,
          this.Thread.messages,
        );
        this.Thread._id = thread._id as unknown as mongoose.Schema.Types.ObjectId;
      } 
      return escapeString(botResponse.content);
    } catch (error: any) {
      if (error instanceof AxiosError) {
        console.error(error.toJSON());
      }
      console.log(error.response?.data?.error);
      return 'Une erreur est survenue';
    }
  }
  async transcribeAudio(audio: string) {
    const aiResponse = await this.openai.createTranscription(fs.createReadStream(audio), "whisper-1", undefined, undefined, undefined, "fr");
    const userMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: aiResponse.data.text,
    };
    if (!this.Thread) {
      return 'Une erreur est survenue';
    }
    this.Thread.messages.push(userMessage);
    return aiResponse.data;
  }
  async getBalance() {
    //to test
    const threads: Thread[] = await this.threadRepository.listThreads();
    const balance = threads.reduce((acc, thread) => {
      return acc + (thread.usage.completion_tokens + thread.usage.prompt_tokens) / 1000 * 0.002;
    }, 0);
    return balance;
  }
  async newConversation() {
    if (!this.Thread) {
      return 'Une erreur est survenue';
    }
    await this.threadRepository.updateThread(this.Thread?._id as unknown as string, this.Thread);

    this.Thread = {
      _id : undefined,
      messages: [],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
      },
      name: 'default',
      model: 'gpt-3.5-turbo',
      lastUpdated: new Date(),
    } as Thread;
    console.log('new conversation');
  }
  async checkIfMessageIsFlagged(message: string): Promise<boolean> {
    const payload: CreateModerationRequest = {
      input: message
    };
    const aiResponse = await this.openai.createModeration(payload);
    return aiResponse.data.results[0].flagged;
  };
  async generateImage(message: string) {
    const payload: CreateImageRequest = {
      prompt: message,
      n: 1,
      size: "512x512",
    };
    const aiResponse = await this.openai.createImage(payload);
    if (aiResponse.data.data.length === 0) {
      return null;
    }
    await this.imageRepository.createImage(aiResponse.data.data[0].url as string, message);
    return aiResponse.data.data[0].url;
  };
  async changeThread(id: string) {
    const thread = await this.threadRepository.getThreadById(id);
    if (thread) {
      this.Thread = thread;
      return thread;
    }
    return null;
  }
  async getContext() {
    if (!this.Thread || !this.Thread._id) {
      return 'Une erreur est survenue';
    }
    return (this.Thread._id.toString());
  }
  async getModel() {
    if (!this.Thread) {
      return 'Une erreur est survenue';
    }
    return this.Thread.model;
  }
  async changeModel(model: string) {
    if (!this.Thread) {
      return 'Une erreur est survenue';
    }
    this.Thread.model = model;
    return model;
  }
}

export default AIService;
