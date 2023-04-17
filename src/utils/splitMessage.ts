function splitMessage(message: string): string[] {
  const MAX_LENGTH = 4096;
  const messageArray = [];

  while (message.length > 0) {
    messageArray.push(message.substring(0, MAX_LENGTH));
    message = message.substring(MAX_LENGTH);
  }

  return messageArray;
}

export default splitMessage;
