import { botEnv } from "../env/config";
import { Telegraf } from 'telegraf';

const bot = new Telegraf(botEnv.BOT_TOKEN);

export default bot;
