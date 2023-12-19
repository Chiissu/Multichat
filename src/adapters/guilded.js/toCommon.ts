import { Message } from "../";
import { Client, UserType, Message as GuildedMessage } from "guilded.js";
import { messageRebuild } from "./toPlatform";

export function adaptMessage(message: GuildedMessage, client: Client): Message {
  return {
    type: "Message",
    platform: {name: "guilded", host: "guilded.gg"},
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
      let remappedContent = messageRebuild(content);
      remappedContent && message.reply(remappedContent);
    },
    send: (content) => {
      let remappedContent = messageRebuild(content);
      remappedContent && message.send(remappedContent);
    },
  };
}
