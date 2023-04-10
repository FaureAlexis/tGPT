import bot from "./bot/commands";
import { Logger } from 'node-colorful-logger';
import AIService from "./openai/openAI.service";
import { botEnv } from "./env/config";
import Voice from "./bot/voice";

const logger = new Logger();
logger.enableDebugMode();
const aiService = new AIService();

bot.launch()
logger.info("Bot launched");

bot.use(async (ctx, next) => {
  //benchmark
  const start = new Date().getTime();
  await next();
  const ms = new Date().getTime() - start;
  logger.debug(`Response time: ${ms}ms`);
})

bot.on("message", async (ctx) => {
  ctx.sendChatAction("typing");
  if ("text" in ctx.message) {
    const message = ctx.message.text;
    if (message.startsWith("/image")) {
      const image = await aiService.generateImage(message.replace('/image', '') as string);
      if (!image) {
        ctx.reply("Un problème est survenu");
        return;
      }
      ctx.replyWithPhoto({ url: image });
      return;
    }
    const reply = await aiService.reply(message);
    ctx.replyWithMarkdownV2(reply);
  } else {
    if ("voice" in ctx.message) {
      const file_id = ctx.message.voice.file_id;
      const file = await ctx.telegram.getFile(file_id);
      const file_path = file.file_path;
      const file_url = `https://api.telegram.org/file/bot${botEnv.BOT_TOKEN}/${file_path}`;
      const voice = new Voice();
      voice.handle(file_url).then(async (message) => {
        const reply = await aiService.reply(message as string);
        ctx.replyWithMarkdownV2(reply);
      }).catch((err) => {
        console.log(err);
      });
    } else {
      ctx.reply("I don't understand you");
    }
  }
});

