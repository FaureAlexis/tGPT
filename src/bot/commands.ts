import bot from "./bot";
import AIService from "../openai/openAI.service";
import escapeString from "../utils/escapeString";
import ThreadRepository from "../database/repository/thread";
import { InlineKeyboardButton, CallbackQuery } from "telegraf/typings/core/types/typegram";

const aiService = new AIService();
const threadRepository = new ThreadRepository();

interface query {
  data: string;
}

bot.start((ctx) => ctx.reply("Bienvenue sur le bot OpenAI"));

bot.help((ctx) => ctx.reply("Commands:\n \
⚪ /new – Start new dialog\n\
⚪ /model – Select chat mode\n\
⚪ /threads – Select thread\n\
⚪ /settings – Show settings\n\
⚪ /balance – Show balance\n\
⚪ /help – Show help"));

// handle /settings command
bot.command("settings", (ctx) => {
  ctx.reply("Settings");
});

bot.command("threads", async (ctx) => {
  const threads = await threadRepository.listThreads();
  const buttons = threads.map((thread) => {
    return {
      text: thread.name,
      callback_data: thread._id as unknown as string,
    };
  });
  ctx.reply("Select a thread", {
    reply_markup: {
      inline_keyboard: [buttons],
    },
  });
});

bot.command("model", async (ctx) => {
  const currentModel = await aiService.getModel();
  const models = ["gpt-4", "gpt-3.5-turbo", "gpt-3.5-legacy"];
  const buttons = models.map((model) => {
    return {
      text: model,
      callback_data: model,
    };
  }
  );
  ctx.reply(`Current model: ${currentModel}`);
  ctx.reply("Select a model", {
    reply_markup: {
      inline_keyboard: [buttons],
    },
  });
});

// handle /balance command
bot.command("balance", async (ctx) => {
  const balance = await aiService.getBalance();
  const md = `Usage: *${escapeString(balance.toString())}$*`;
  ctx.replyWithMarkdownV2(md);
});

// handle /mode command
bot.command("mode", (ctx) => {
  ctx.reply("Mode");
});

// handle /retry command
bot.command("retry", (ctx) => {
  ctx.reply("Retry");
});

// handle /new command
bot.command("new", async (ctx) => {
  await aiService.newConversation();
  ctx.reply("✅ - New conversation started");
});

bot.command("context", async (ctx) => {
  const thread = await aiService.getContext();
  ctx.reply(thread);
});

bot.on("callback_query", async (ctx) => {
  if (!ctx.callbackQuery) {
    return;
  }
  const cbQuery: query = ctx.callbackQuery as query;
  if (cbQuery.data.includes("gpt")) {
    await aiService.changeModel(cbQuery.data);
    ctx.answerCbQuery("✅ - Model changed");
  } else {
    const threadId = cbQuery.data as string;
    await aiService.changeThread(threadId);
    ctx.answerCbQuery("✅ - Thread changed");
  }
});

export default bot;
