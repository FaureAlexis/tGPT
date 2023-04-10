import dotenv from 'dotenv';
dotenv.config();

interface BotEnv {
  BOT_TOKEN: string;
  OPENAI_API_KEY: string;
  MONGO_URI: string;
}

const bot_token = process.env.BOT_TOKEN;
const openai_api_key = process.env.OPENAI_API_KEY;
const mongo_uri = process.env.MONGO_URI;

if (!bot_token || bot_token === undefined) {
  throw new Error('BOT_TOKEN is not defined');
}
if (!openai_api_key || openai_api_key === undefined) {
  throw new Error('OPENAI_API_KEY is not defined');
}
if (!mongo_uri || mongo_uri === undefined) {
  throw new Error('MONGO_URI is not defined');
}

export const botEnv: BotEnv = {
  BOT_TOKEN: bot_token,
  OPENAI_API_KEY: openai_api_key,
  MONGO_URI: mongo_uri,
};
