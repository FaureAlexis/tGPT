import splitMessage from "../utils/splitMessage";
import escapeString from "../utils/escapeString";
import Context from "../types/telegram/context";

function reply(ctx: Context, message: string) {
  const messages = splitMessage(message);
  messages.forEach((message) => {
    ctx.replyWithMarkdownV2(message);
  });
}

export default reply;
