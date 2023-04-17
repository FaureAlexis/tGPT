import { NarrowedContext, Context } from "telegraf";
import { Update, Message } from "telegraf/typings/core/types/typegram";

type Context = NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>;

export default Context;
