import { Message } from "../";
import { Client, UserType, Message as GuildedMessage } from "guilded.js";
import { contentToMessage } from "./toPlatform";

export function adaptMessage(message: GuildedMessage, client: Client): Message {
  return {
    content: message.content as string,
    author: {
      name: message.author?.name ?? null,
      isBot: message.author?.type == UserType.Bot,
    },
    mentions: {
      me:
        client.user && message.mentions?.users
          ? message.mentions?.users.some((user) => user.id == client.user.id)
          : false,
      everyone: message.mentions?.everyone ?? false,
    },
    reply: (content) => {
      let remappedContent = contentToMessage(content);
      remappedContent && message.reply(remappedContent);
    },
    send: (content) => {
      let remappedContent = contentToMessage(content);
      remappedContent && message.send(remappedContent);
    },
  };
}
