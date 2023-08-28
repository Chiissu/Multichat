import { Message } from "../";
import { Client, UserType, Message as GuildedMessage } from "guilded.js";
import { contentToMessage } from "./toPlatform";

export function adaptMessage(message: GuildedMessage, client: Client): Message {
  return {
    platform: "guilded",
    content: message.content as string,
    author: {
      name: message.author?.name ?? null,
      isBot: message.author?.type == UserType.Bot,
      id: message.author?.id ?? "",
      avatarURL: message.author?.avatar ?? null,
    },
    mentions: {
      me:
        client.user && message.mentions?.users
          ? message.mentions?.users.some((user) => user.id == client.user?.id)
          : false,
      everyone: message.mentions?.everyone ?? false,
    },
	id: message.id,
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
