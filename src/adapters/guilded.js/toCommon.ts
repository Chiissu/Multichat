import { Message, User } from "../";
import { Client, UserType, Message as GuildedMessage, User as GuildedUser, Member } from "guilded.js";
import { messageRebuild } from "./toPlatform";

export function adaptMessage(message: GuildedMessage, client: Client): Message {

  return {
    type: "Message",
    platform: { name: "guilded", host: "guilded.gg" },
    content: message.content as string,
    author: adaptUser(message.author || client.user!, client),
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

export function adaptUser(user: GuildedUser, client: Client): User {
  return {
    name: user.name,
    isBot: user.type == UserType.Bot,
    id: user.id,
    avatarURL: user.avatar,
  }
}
