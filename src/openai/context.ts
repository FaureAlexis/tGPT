import { Thread } from '../database/schemas/thread';

function countTokens(thread: Thread): number {
  let count = 0;
  thread.messages.forEach((message) => {
    count += message.content.split(' ').length;
  });
  return count;
}

export default countTokens;

